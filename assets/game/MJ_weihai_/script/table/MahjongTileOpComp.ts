// @import
import AllMahjongValImg from "../AllMahjongValImg";

// @const
const { ccclass } = cc._decorator;

/**
 * 麻将牌操作组件
 */
@ccclass
export default class MahjongTileOpComp extends cc.Component {
    /**
     * 点击玩家信息事件
     */
    static readonly EVENT_TOUCH_END: string = "gKWrQJYnGAprNTlf35_mahjongTileOpComp_onTouchEnd";

    /**
     * 麻将牌面值
     */
    _nMahjongVal: number = -1;

    /**
     * 所在位置
     */
    _nAtPos: number = -1;

    /**
     * 状态
     */
    _nState: number = 0;
    
    /**
     * 是否为赖子牌 (一赖到底玩法)
     */
    _bIsLaiZi: boolean = false;

    // /**
    //  * onLoad
    //  */
    // onLoad(): void {
    // }

    /**
     * start
     */
    start(): void {
        __regUIEvent(this);
    }

    // /**
    //  * update
    //  * 
    //  * @param nDeltaTime 变化时间
    //  */
    // update (nDeltaTime: number): void {
    // }

    /**
     * 获取麻将牌面值
     * 
     * @return 麻将牌面值
     */
    getVal(): number {
        return this._nMahjongVal;
    }

    /**
     * 设置麻将牌面值
     * 
     * @param nMahjongVal 麻将牌面值
     * @return this 指针
     */
    putVal(nMahjongVal: number): MahjongTileOpComp {
        this._nMahjongVal = nMahjongVal;
        __changeAMahjongVal(
            cc.find("Val", this.node), nMahjongVal
        );

        return this;
    }

    /**
     * 获取所在位置
     * 
     * @return 所在位置
     */
    getAtPos(): number {
        return this._nAtPos;
    }

    /**
     * 设置所在位置
     * 
     * @param nVal 整数值
     * @return this 指针
     */
    putAtPos(nVal: number): MahjongTileOpComp {
        this._nAtPos = nVal;
        return this;
    }

    /**
     * 获取状态
     * 
     * @return 0 = 正常状态, 1 = 躺倒, 2 = 扣起来, 3 = 抬起
     */
    getState(): number {
        return this._nState;
    }

    /**
     * 设置麻将牌状态
     * 
     * @param nState 状态, 0 = 正常状态, 1 = 躺倒, 2 = 扣起来, 3 = 抬起
     */
    setState(nState: number): void {
        this._nState = nState;
        __changeState(this.node, nState);
    }
    
    /**
     * 获取是否为赖子牌
     * 
     * @return 是否为赖子牌
     */
    getIsLaiZi(): boolean {
        return this._bIsLaiZi;
    }
    
    /**
     * 设置是否为赖子牌
     * 
     * @param bIsLaiZi 是否为赖子牌
     * @return this 指针
     */
    setIsLaiZi(bIsLaiZi: boolean): MahjongTileOpComp {
        this._bIsLaiZi = bIsLaiZi;
        __updateLaiZiMark(this.node, bIsLaiZi);
        return this;
    }
}

///////////////////////////////////////////////////////////////////////

/**
 * 注册 UI 事件
 * 
 * @param SELF this 指针
 */
function __regUIEvent(SELF: MahjongTileOpComp): void {
    if (null == SELF) {
        return;
    }

    // 注册触摸结束事件
    SELF.node.on(cc.Node.EventType.TOUCH_END, (/*oEvent*/) => {
        // 创建自定义事件，通过 userData 传递节点对象
        let oCustomEvent = new cc.Event.EventCustom(MahjongTileOpComp.EVENT_TOUCH_END, true);
        oCustomEvent.setUserData(SELF.node);

        // 派发自定义事件
        SELF.node.dispatchEvent(oCustomEvent);
    });
}

/**
 * 修改麻将牌花
 * 
 * @param oValNode 麻将面值节点
 * @param nMahjongVal 麻将面值
 */
function __changeAMahjongVal(oValNode: cc.Node, nMahjongVal: number): void {
    if (null == oValNode) {
        cc.log("oValNode is null");
        return;
    }

    if (nMahjongVal <= 0) {
        // 清除图片并关闭节点
        (oValNode.getComponent(cc.Sprite).spriteFrame as any) = null;
        oValNode.active = false;
        return;
    }

    // 设置麻将牌花图片
    oValNode.active = true;
    const oSprite = oValNode.getComponent(cc.Sprite);
    if (oSprite) {
        const oFrame = AllMahjongValImg.getSpriteFrame(nMahjongVal);
        if (oFrame) {
            oSprite.spriteFrame = oFrame;
        }
    }
}

/**
 * 修改状态
 * 
 * @param oRootNode 根节点
 * @param nNewState 新状态, 0 = 正常状态, 1 = 躺倒, 2 = 扣起来, 3 = 抬起
 */
function __changeState(oRootNode: cc.Node, nNewState: number): void {
    if (null == oRootNode) {
        return;
    }

    let oSpecStateNode = cc.find(`State_${nNewState}_`, oRootNode);

    if (null == oSpecStateNode) {
        return;
    }

    //#region 更新根节点位置
    if (0 == nNewState || 
        3 == nNewState) {
        // 如果是正常状态或者是提起状态,
        // 需要播放缓动
        cc.Tween.stopAllByTarget(oRootNode);
        cc.tween(oRootNode)
            .to(0.10, { x: oSpecStateNode.x, y: oSpecStateNode.y, })
            .start();
    } else {
        oRootNode.x = oSpecStateNode.x;
        oRootNode.y = oSpecStateNode.y;
    }
    //#endregion

    //#region 更新背景图片
    let oUsingBG = cc.find("BG", oSpecStateNode)
        .getComponent(cc.Sprite)
        .spriteFrame;

    cc.find("BG", oRootNode).getComponent(cc.Sprite).spriteFrame = oUsingBG;
    //#endregion

    //#region 更新面值
    let oState_X_Val = cc.find("Val", oSpecStateNode);
    let oShowVal = cc.find("Val", oRootNode);

    if (null == oState_X_Val) {
        (oShowVal.getComponent(cc.Sprite).spriteFrame as any) = null;
        oShowVal.zIndex = -1;
        oShowVal.active = false;
    } else {
        oShowVal.zIndex = 255;
        oShowVal.angle = oState_X_Val.angle;
        oShowVal.x = oState_X_Val.x;
        oShowVal.y = oState_X_Val.y;
        oShowVal.scaleX = oState_X_Val.scaleX;
        oShowVal.scaleY = oState_X_Val.scaleY;
        oShowVal.active = true;
    }
    //#endregion
}

/**
 * 更新赖子牌标记（增强版 - 如果节点不存在则动态创建）
 * 
 * @param oRootNode 根节点（麻将牌节点）
 * @param bIsLaiZi 是否是赖子牌
 */
function __updateLaiZiMark(oRootNode: cc.Node, bIsLaiZi: boolean): void {
    if (null == oRootNode) {
        return;
    }

    let oLaiZiMark = cc.find("LaiZiMark", oRootNode);

    // 如果节点不存在，动态创建
    if (null == oLaiZiMark) {
        // 创建 LaiZiMark 节点
        oLaiZiMark = new cc.Node("LaiZiMark");
        oRootNode.addChild(oLaiZiMark);
        
        // 添加 Label 组件显示"赖"字
        let oLabel = oLaiZiMark.addComponent(cc.Label);
        oLabel.string = "赖";
        oLabel.fontSize = 24;
        oLabel.lineHeight = 24;
        oLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        oLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        oLabel.overflow = cc.Label.Overflow.NONE;
        
        // 设置金色
        oLabel.node.color = new cc.Color(255, 215, 0); // 金色 RGB(255, 215, 0)
        
        // 设置节点位置（右上角）
        oLaiZiMark.setPosition(30, 30); // 根据麻将牌大小调整
        
        // 设置节点大小
        oLaiZiMark.width = 50;
        oLaiZiMark.height = 50;
        
        // 添加 Widget 组件保持相对位置
        let oWidget = oLaiZiMark.addComponent(cc.Widget);
        oWidget.isAlignRight = true;
        oWidget.isAlignTop = true;
        oWidget.right = 5;
        oWidget.top = 5;
    }

    // 控制显示/隐藏
    oLaiZiMark.active = bIsLaiZi;
}
