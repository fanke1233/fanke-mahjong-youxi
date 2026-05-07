# 对话记录 - 2026-04-23

## 会话信息
- **日期**：2026-04-23
- **项目**：xiantaomj.cocos2d_client-main（威海麻将 Cocos2d 客户端）
- **主要任务**：选牌预览功能实现（单击预览胡牌、双击出牌）

---

## 对话 1：选牌预览功能实现

### 问题描述
用户要求实现"选牌预览"功能，让玩家在单击某张牌时（还未打出去）就能预览如果打出这张牌后可以胡哪些牌。需要区分单击和双击操作：
- 单击：发送预览请求，显示可胡牌列表
- 双击：确认出牌，走现有的出牌逻辑

### 需求分析
1. 客户端行为：
   - 单击某张牌：选牌预览 → 发送消息到服务端请求听牌预测
   - 双击某张牌：确认出牌 → 走现有的出牌逻辑

2. 服务端需要做的：
   - 接收客户端的"选牌预览"请求（包含玩家想打出的牌）
   - 模拟打出这张牌后的手牌状态
   - 计算剩余手牌的可胡牌列表
   - 返回给客户端

3. 功能限制：
   - 只在"一赖到底"玩法中生效
   - 玩家单击某张牌时（还没打出去）就能预览如果打出这张牌后可以胡哪些牌
   - 如果可胡牌列表为空，说明打出这张牌后无法听牌
   - 每次单击不同的牌，会重新计算对应的可胡牌列表

### 实现步骤

#### 步骤 1：添加协议定义

**修改文件**：[`protocol/MJ_weihai_Protocol.proto`](file://d:\xiantaomj.cocos2d_client-main\protocol\MJ_weihai_Protocol.proto)

添加消息编号：
```protobuf
_MahjongSelectTilePreviewCmd = 1076,
_MahjongSelectTilePreviewResult = 1077
```

添加消息定义：
```protobuf
// 选牌预览请求（单击麻将牌时发送）
message MahjongSelectTilePreviewCmd {
    // 玩家想打出的牌
    required sint32 selectTile = 1;
}

// 选牌预览结果
message MahjongSelectTilePreviewResult {
    // 玩家想打出的牌
    required sint32 selectTile = 1;
    
    // 如果打出这张牌后，可以胡的牌面列表（空数组表示无法听牌）
    repeated sint32 huTileArray = 2;
}
```

#### 步骤 2：生成协议代码

执行命令：
```bash
cd d:\xiantaomj.cocos2d_client-main\protocol
autoGen.cmd
```

验证结果：
- ✅ `MahjongSelectTilePreviewCmd` 类已生成（包含 selectTile 字段）
- ✅ `MahjongSelectTilePreviewResult` 类已生成（包含 selectTile 和 huTileArray 字段）
- ✅ 消息代码枚举 `_MahjongSelectTilePreviewCmd = 1076` 已生成
- ✅ 消息代码枚举 `_MahjongSelectTilePreviewResult = 1077` 已生成

#### 步骤 3：创建 Handler 处理器

**新建文件**：[`assets/game/MJ_weihai_/script/resulthandler/MahjongSelectTilePreviewResultHandler.ts`](file://d:\xiantaomj.cocos2d_client-main\assets\game\MJ_weihai_\script\resulthandler\MahjongSelectTilePreviewResultHandler.ts)

```typescript
// @import
import ModConfig from "../ModConfig.ver_MJ_weihai_";
import MJ_weihai_Scene from "../MJ_weihai_Scene";
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";

/**
 * 选牌预览结果处理器
 * 处理服务端返回的选牌预览结果
 */
export default class MahjongSelectTilePreviewResultHandler {
    /**
     * 处理选牌预览结果
     *
     * @param SELF 场景实例
     * @param oResult 服务端返回的预览结果
     */
    static handle(SELF: MJ_weihai_Scene, oResult: mod_MJ_weihai_Protocol.msg.MahjongSelectTilePreviewResult): void {
        if (!oResult) {
            cc.error("选牌预览结果处理器：响应数据为空");
            return;
        }

        const nSelectTile = oResult.selectTile;
        const huTileArray = oResult.huTileArray || [];

        cc.log(`选牌预览结果：selectTile = ${nSelectTile}, huTileArray = [${huTileArray.join(", ")}]`);

        // 调用场景的预览结果显示方法
        if (SELF) {
            SELF.showSelectTilePreview(oResult);
        } else {
            cc.error("选牌预览结果处理器：场景实例为空");
        }
    }
}
```

#### 步骤 4：注册消息处理器

**修改文件**：[`assets/game/MJ_weihai_/script/resulthandler/__onMsgHandler.ver_MJ_weihai_.ts`](file://d:\xiantaomj.cocos2d_client-main\assets\game\MJ_weihai_\script\resulthandler\__onMsgHandler.ver_MJ_weihai_.ts)

添加导入：
```typescript
import MahjongSelectTilePreviewResultHandler from "./MahjongSelectTilePreviewResultHandler";
```

注册消息：
```typescript
oMap["MahjongSelectTilePreviewResult"] = MahjongSelectTilePreviewResultHandler;
```

#### 步骤 5：Scene 场景管理

**修改文件**：[`assets/game/MJ_weihai_/script/MJ_weihai_Scene.ts`](file://d:\xiantaomj.cocos2d_client-main\assets\game\MJ_weihai_\script\MJ_weihai_Scene.ts)

添加导入：
```typescript
import RuleKeyDef from "../../../bizdata/script/RuleKeyDef";
```

添加成员变量：
```typescript
/**
 * 当前预览的牌
 */
_nSelectTilePreview: number = -1;

/**
 * 可胡牌列表（预览）
 */
_oSelectTilePreviewHuArray: Array<number> = [];
```

实现方法：
```typescript
/**
 * 发送选牌预览请求（一赖到底玩法）
 * 
 * @param nTileValue 玩家想打出的牌
 */
sendSelectTilePreviewCmd(nTileValue: number): void {
    if (nTileValue <= 0) {
        cc.error("无效的牌值");
        return;
    }
    
    // 检查是否是一赖到底玩法
    const oCachedRoom = CachedData.getCachedRoom();
    if (!oCachedRoom) {
        cc.error("未找到房间数据");
        return;
    }
    
    const oRuleSetting = oCachedRoom.ruleSetting;
    // 检查是否启用了"一赖到底"玩法（KEY_PLAY_METHOD_YI_LAI_DAO_DI = 2011）
    if (oRuleSetting[RuleKeyDef.KEY_PLAY_METHOD_YI_LAI_DAO_DI] != 1) {
        cc.log("选牌预览：非一赖到底玩法，不发送请求");
        return;
    }
    
    // 发送选牌预览请求
    const oCmd = new mod_MJ_weihai_Protocol.MahjongSelectTilePreviewCmd();
    oCmd.selectTile = nTileValue;
    
    cc.log(`发送选牌预览请求, selectTile = ${nTileValue}`);
    MsgBus.getInstance().sendMsg(
        mod_MJ_weihai_Protocol.MJ_weihai_MsgCodeDef._MahjongSelectTilePreviewCmd,
        oCmd
    );
}

/**
 * 显示选牌预览结果
 * 
 * @param oResult 服务端返回的预览结果
 */
showSelectTilePreview(oResult: mod_MJ_weihai_Protocol.msg.MahjongSelectTilePreviewResult): void {
    if (!oResult) {
        return;
    }
    
    this._nSelectTilePreview = oResult.selectTile;
    this._oSelectTilePreviewHuArray = oResult.huTileArray || [];
    
    cc.log(`显示选牌预览：selectTile = ${this._nSelectTilePreview}, huTileArray = [${this._oSelectTilePreviewHuArray.join(", ")}]`);
    
    // 更新UI显示
    this.updateSelectTilePreviewUI();
}

/**
 * 隐藏选牌预览
 */
hideSelectTilePreview(): void {
    this._nSelectTilePreview = -1;
    this._oSelectTilePreviewHuArray = [];
    
    // 隐藏UI
    // TODO: 隐藏预览显示区域
}

/**
 * 更新选牌预览UI显示
 */
updateSelectTilePreviewUI(): void {
    // TODO: 动态创建胡牌牌面显示区域
    // 参考 updateHuTileDisplay 的实现
    cc.log(`更新选牌预览UI, huTileArray = [${this._oSelectTilePreviewHuArray.join(", ")}]`);
}
```

#### 步骤 6：实现单击/双击判断逻辑

**修改文件**：[`assets/game/MJ_weihai_/script/table/MahjongTableComp.ts`](file://d:\xiantaomj.cocos2d_client-main\assets\game\MJ_weihai_\script\table\MahjongTableComp.ts)

添加导入：
```typescript
import MJ_weihai_Scene from "../MJ_weihai_Scene";
```

添加成员变量：
```typescript
/**
 * 单击/双击判断相关
 */
_nLastClickTime: number = 0;           // 上次点击时间
_nLastClickTile: number = -1;          // 上次点击的牌
_nClickTimer: number = -1;             // 单击延迟定时器
```

修改 `onAMahjongTileClick` 方法：
```typescript
/**
 * 麻将牌点击事件, 事件流:
 * MahjongTileOpComp --> MahjongInHandGroupComp --> MahjongTableComp ( 当前类 )
 * 
 * @param oMahjongTileOpNode 麻将牌操作节点
 */
onAMahjongTileClick(oMahjongTileOpNode: cc.Node): void {
    if (null == oMahjongTileOpNode) {
        return;
    }

    // 获取麻将牌组件
    const oTileComp = oMahjongTileOpNode.getComponent("MahjongTileOpComp") as any;
    if (!oTileComp) {
        cc.error("找不到MahjongTileOpComp组件");
        return;
    }

    // 获取牌值
    const nTileValue = oTileComp.getVal ? oTileComp.getVal() : -1;
    if (nTileValue <= 0) {
        cc.warn("无效的牌值");
        return;
    }

    const nCurrentTime = Date.now();
    const nTimeDiff = nCurrentTime - this._nLastClickTime;

    // 判断是单击还是双击（300ms时间窗口）
    if (this._nLastClickTile === nTileValue && nTimeDiff < 300 && nTimeDiff > 0) {
        // 双击：确认出牌
        clearTimeout(this._nClickTimer);
        this._nLastClickTime = 0;
        this._nLastClickTile = -1;
        
        cc.log(`双击出牌: ${nTileValue}`);
        this.onConfirmChuPai(nTileValue);
    } else {
        // 单击：选牌预览（延迟300ms执行，如果300ms内再次点击则取消）
        this._nLastClickTime = nCurrentTime;
        this._nLastClickTile = nTileValue;
        
        // 清除之前的定时器
        if (this._nClickTimer > 0) {
            clearTimeout(this._nClickTimer);
        }
        
        // 设置新的定时器
        this._nClickTimer = setTimeout(() => {
            cc.log(`单击预览: ${nTileValue}`);
            this.onSelectTilePreview(nTileValue);
            this._nClickTimer = -1;
        }, 300);
    }
}

/**
 * 选牌预览（一赖到底玩法）
 * 玩家单击某张牌时调用，预览如果打出这张牌后可以胡哪些牌
 * 
 * @param nTileValue 玩家想打出的牌
 */
onSelectTilePreview(nTileValue: number): void {
    // 获取Scene实例
    const oScene = cc.director.getScene()?.getComponentInChildren(MJ_weihai_Scene);
    if (oScene) {
        oScene.sendSelectTilePreviewCmd(nTileValue);
    } else {
        cc.warn("找不到MJ_weihai_Scene组件");
    }
}

/**
 * 确认出牌
 * 
 * @param nTileValue 要打出的牌
 */
onConfirmChuPai(nTileValue: number): void {
    // TODO: 这里调用现有的出牌逻辑
    // 例如：发送MahjongChuPaiCmd消息到服务端
    cc.log(`执行出牌逻辑: ${nTileValue}`);
    
    // 隐藏选牌预览
    const oScene = cc.director.getScene()?.getComponentInChildren(MJ_weihai_Scene);
    if (oScene) {
        oScene.hideSelectTilePreview();
    }
}
```

#### 步骤 7：修复 TypeScript 类型错误

**修复内容**：
1. `_oMahjongSeatIndexer` 改为可选类型：`_oMahjongSeatIndexer?: MahjongSeatIndexer;`
2. `getMahjongInHand` 方法返回空数组而不是 null：`return [];`
3. `getMahjongMoPai` 方法使用 `??` 运算符处理 undefined：`return oPlayerData.mahjongMoPai ?? -1;`
4. `getShowAnimationPos` 方法返回类型改为 `cc.Node | undefined`
5. 使用可选链运算符处理可能为 undefined 的对象：`this._oMahjongSeatIndexer?.getSeatIndexAtClient(...)`

### 数据流

```
玩家单击麻将牌 (300ms内只点击一次)
    ↓
MahjongTableComp.onAMahjongTileClick()
    ↓
启动300ms定时器
    ↓
300ms后触发 onSelectTilePreview(nTileValue)
    ↓
MJ_weihai_Scene.sendSelectTilePreviewCmd(nTileValue)
    ↓
检查是否一赖到底玩法
    ↓
发送 MahjongSelectTilePreviewCmd (selectTile=XX)
    ↓
服务端处理：
    - 模拟打出手牌
    - 计算可胡牌列表
    ↓
服务端返回 MahjongSelectTilePreviewResult (huTileArray=[...])
    ↓
MahjongSelectTilePreviewResultHandler.handle()
    ↓
MJ_weihai_Scene.showSelectTilePreview()
    ↓
updateSelectTilePreviewUI()
    ↓
在手牌上方显示可胡牌列表

---

玩家双击麻将牌 (300ms内点击两次)
    ↓
MahjongTableComp.onAMahjongTileClick()
    ↓
检测到双击，取消定时器
    ↓
onConfirmChuPai(nTileValue)
    ↓
执行出牌逻辑
    ↓
hideSelectTilePreview()
```

### 修改的文件清单

1. **协议定义**
   - `protocol/MJ_weihai_Protocol.proto` - 添加消息定义

2. **Handler 处理**
   - `assets/game/MJ_weihai_/script/resulthandler/MahjongSelectTilePreviewResultHandler.ts` - 新建
   - `assets/game/MJ_weihai_/script/resulthandler/__onMsgHandler.ver_MJ_weihai_.ts` - 注册消息

3. **场景管理**
   - `assets/game/MJ_weihai_/script/MJ_weihai_Scene.ts` - 添加选牌预览功能

4. **麻将桌组件**
   - `assets/game/MJ_weihai_/script/table/MahjongTableComp.ts` - 实现单击/双击判断

5. **类型修复**
   - `assets/game/MJ_weihai_/script/table/MahjongTableComp.ts` - 修复TypeScript类型错误

### 待完成工作

1. **UI显示实现**：`updateSelectTilePreviewUI()` 方法需要实现具体的UI显示逻辑（参考 `updateHuTileDisplay` 方法）
2. **出牌逻辑集成**：`onConfirmChuPai()` 方法需要调用现有的出牌逻辑
3. **服务端配合**：服务端需要实现 `MahjongSelectTilePreviewCmd` 消息的处理逻辑
4. **测试验证**：编译项目并测试单击/双击功能

### 注意事项

1. **协议生成后必须重新加载VSCode**：TypeScript编译器可能缓存旧的类型定义，需要执行 "Developer: Reload Window" 或 "TypeScript: Restart TS Server"
2. **300ms时间窗口**：单击和双击的时间间隔设置为300ms，可以根据用户体验调整
3. **仅一赖到底玩法生效**：通过检查 `RuleKeyDef.KEY_PLAY_METHOD_YI_LAI_DAO_DI` 确保功能只在指定玩法中启用
4. **定时器清理**：必须在双击时清除单击的定时器，避免重复触发

### 经验总结

1. **协议生成验证**：执行 `autoGen.cmd` 后，应立即通过搜索生成的 `.d.ts` 文件验证新字段是否已正确生成
2. **TypeScript类型安全**：避免使用 `null` 作为 `Array<T>` 类型的初始值，应使用 `[]` 和可选类型 `?`
3. **单击/双击判断**：使用定时器延迟执行单击逻辑，双击时取消定时器，这是常见的交互模式实现方式
4. **MsgBus消息发送规范**：`MsgBus.getInstance().sendMsg` 必须传递两个参数：消息代码和消息体对象

---

*记录生成时间：2026-04-23*
