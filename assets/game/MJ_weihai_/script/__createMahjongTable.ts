// @import
import AllMahjongValImg from "./AllMahjongValImg";
import HuFormula from "./hupattern/HuFormula";
import HuCalculator from "./HuCalculator";
import MahjongTableComp from "./table/MahjongTableComp";
import MahjongTableFactory from "./table/MahjongTableFactory";
import MahjongTileDef from "./MahjongTileDef";
import MahjongTileOpComp from "./table/MahjongTileOpComp";
import MJ_weihai_Scene from "./MJ_weihai_Scene";
import MsgBus from "../../../comm/script/MsgBus";
import UserData from "../../../bizdata/script/UserData";
import CachedData from "../../../bizdata/script/CachedData";
import CachingKeyDef from "../../../bizdata/script/CachingKeyDef";
import RuleKeyDef from "../../../bizdata/script/RuleKeyDef";
import { mod_MJ_weihai_Protocol } from "./msg/AllMsg.ver_MJ_weihai_";

/**
 * 创建麻将牌桌, 
 * XXX 注意: 在这里同步数据
 * 
 * @param SELF this 指针
 * @param nMaxPlayer 最大玩家数量
 * @param oSyncRoomDataResult 同步数据结果
 * @param bForceCreate 强制创建新麻将牌桌, false = 不强制创建, 尽量使用旧的
 */
export function __createMahjongTable(SELF: MJ_weihai_Scene, nMaxPlayer: number, oSyncRoomDataResult: any, bForceCreate: boolean = false): void {
    if (null == SELF ||
        null == oSyncRoomDataResult) {
        return;
    }

    if (bForceCreate) {
        cc.find("Canvas/MahjongTableArea").removeAllChildren();
    }

    // 麻将牌桌组件
    let oTableComp: MahjongTableComp | null = null;

    if (cc.find("Canvas/MahjongTableArea").childrenCount <= 0) {
        // 创建麻将牌桌
        let oTableNode = MahjongTableFactory.create(nMaxPlayer);

        if (null == oTableNode) {
            cc.log("创建牌桌为空");
            return;
        }

        // 获取牌桌组件
        oTableComp = oTableNode.getComponent(MahjongTableComp);

        if (null == oTableComp) {
            cc.log("麻将牌桌组件为空");
            return;
        }

        cc.find("Canvas/MahjongTableArea").addChild(oTableNode);
    }
    else {
        // 获取麻将牌桌组件
        oTableComp = cc.find("Canvas/MahjongTableArea").getComponentInChildren(MahjongTableComp);
    }

    if (null == oTableComp) {
        cc.log("麻将牌桌组件为空");
        return;
    }

    // 获取玩家列表
    let oPlayerList = oSyncRoomDataResult.player;
    // 获取第一视角用户
    let oFirstPlayer = oPlayerList.find((oPlayer: { userId: number; }) => oPlayer.userId == UserData.getMyData().getUserId());

    // 添加第一视角玩家
    oTableComp.addPlayer(oFirstPlayer, true);

    // 当选中某个玩家时
    oTableComp.onSelectedAPlayer = (oCurrPlayer) => {
        // 显示玩家信息
        SELF.showPlayerInfoDialog(oCurrPlayer);
    }

    // 添加调试日志：打印收到的完整player数据
    cc.log(`[赖子牌追踪] SyncRoomDataResult 收到的 player 数量 = ${oPlayerList.length}`);
    for (let i = 0; i < oPlayerList.length; i++) {
        const oPlayer = oPlayerList[i];
        cc.log(`[赖子牌追踪] Player[${i}] userId = ${oPlayer.userId}, laiGenTile = ${oPlayer.laiGenTile}, laiZiTile = ${oPlayer.laiZiTile}`);
        cc.log(`[赖子牌追踪] Player[${i}] 完整数据 = ${JSON.stringify(oPlayer)}`);
    }

    for (let oPlayer of oPlayerList) {
        if (null == oPlayer) {
            continue;
        }

        // 添加玩家
        oTableComp.addPlayer(oPlayer);

        // 从Player数据中获取赖子牌信息（完全依赖服务端下发）
        let nLaiGenTile = oPlayer.laiGenTile ?? -1;
        let nLaiZiTile = oPlayer.laiZiTile ?? -1;

        // 更新玩家手牌（包含赖子牌信息）
        oTableComp.updateMahjongInHand(
            oPlayer.userId,
            oPlayer.mahjongInHand,
            oPlayer.mahjongMoPai,
            0,  // nState
            nLaiGenTile,  // 赖子生成牌
            nLaiZiTile    // 赖子牌
        );

        // 设置庄家标志
        if (oPlayer.zhuangJiaFlag) {
            oTableComp.putZhuangJiaFlag(oPlayer.userId);
        }

        if (oPlayer.userId == UserData.getMyData().getUserId()) {
            // 如果是自己, 
            // 就可以操作麻将牌
            oTableComp.onAMahjongTileClick = (oMahjongTileOpNode) => {
                __onAMahjongTileClick(
                    SELF, oTableComp, oMahjongTileOpNode
                );
            };
        }
    }

    // 所有玩家都落座之后,
    // 显示吃碰杠
    for (let oPlayer of oPlayerList) {
        if (null == oPlayer) {
            continue;
        }

        // 根据用户 Id 清除吃碰杠展示 ( 包括亮风 )
        oTableComp.clearChiPengGangByUserId(oPlayer.userId);

        // 显示麻将亮风
        __showMahjongLiangFeng(oTableComp, oPlayer);
        // 显示麻将吃碰杠
        __showMahjongChiPengGang(oTableComp, oPlayer);
        // XXX 注意: 一定是先展示吃碰杠,
        // 再更新已经打出的牌!
        // 因为显示吃碰杠牌是调用的 doMahjongChi、doMahjongPeng、doMahjongGang,
        // 这几个函数在执行的时候会检查并扣除最后打出的那张牌,
        // 如果先更新了已经打出的牌, 
        // 那么就有可能会出现某个已经打出的牌被 “吃掉” 的 Bug...

        // 更新玩家已经打出的麻将牌
        oTableComp.updateMahjongOutput(
            oPlayer.userId,
            oPlayer.mahjongOutput
        );
    }

    // 调整指针指向
    oTableComp.redirectActUserId(
        oSyncRoomDataResult.currActUserId, 
        oSyncRoomDataResult.currRoundIndex, 
        oSyncRoomDataResult.remainCardNum, 
        oSyncRoomDataResult.remainTime
    );
}

///////////////////////////////////////////////////////////////////////

/**
 * 亮风玩家
 */
type LiangFengPlayer = {
    userId: number,
    mahjongLiangFeng: {
        kind: number,
        numOfDongFeng: number,
        numOfNanFeng: number, 
        numOfXiFeng: number,
        numOfBeiFeng: number,
        numOfHongZhong: number,
        numOfFaCai: number, 
        numOfBaiBan: number,
    }
};

/**
 * 吃碰杠玩家
 */
type ChiPengGangPlayer = {
    userId: number,
    mahjongChiPengGang: Array<{ 
        kind: number,
        tX: number,
        t0: number, 
        t1: number, 
        t2: number, 
        fromUserId: number, 
    }>,
}

/**
 * 显示麻将亮风
 * 
 * @param oTableComp 麻将牌桌组件
 * @param oPlayer 亮风玩家
 */
function __showMahjongLiangFeng(oTableComp: MahjongTableComp, oPlayer: LiangFengPlayer): void {
    if (null == oTableComp || 
        null == oPlayer || 
        null == oPlayer.mahjongLiangFeng) {
        return;
    }

    let oMahjongLiangFeng = oPlayer.mahjongLiangFeng;
    let oCounterMap: { [nKey: number]: number } = {};
    oCounterMap[MahjongTileDef.DONG_FENG]  = oMahjongLiangFeng.numOfDongFeng;
    oCounterMap[MahjongTileDef.NAN_FENG]   = oMahjongLiangFeng.numOfNanFeng;
    oCounterMap[MahjongTileDef.XI_FENG]    = oMahjongLiangFeng.numOfXiFeng;
    oCounterMap[MahjongTileDef.BEI_FENG]   = oMahjongLiangFeng.numOfBeiFeng;
    oCounterMap[MahjongTileDef.HONG_ZHONG] = oMahjongLiangFeng.numOfHongZhong;
    oCounterMap[MahjongTileDef.FA_CAI]     = oMahjongLiangFeng.numOfFaCai;
    oCounterMap[MahjongTileDef.BAI_BAN]    = oMahjongLiangFeng.numOfBaiBan;

    oTableComp.doUpdateMahjongLiangFeng(
        oPlayer.userId, 
        oMahjongLiangFeng.kind, 
        oCounterMap
    );
}

/**
 * 显示麻将吃碰杠
 * 
 * @param oTableComp 麻将牌桌组件
 * @param oChiPengGangPlayer 吃碰杠玩家
 */
function __showMahjongChiPengGang(
    oTableComp: MahjongTableComp, oChiPengGangPlayer: ChiPengGangPlayer): void {
    if (null == oTableComp || 
        null == oChiPengGangPlayer) {
        return;
    }

    for (let oAChiPengGang of oChiPengGangPlayer.mahjongChiPengGang) {
        if (null == oAChiPengGang) {
            continue;
        }

        switch (oAChiPengGang.kind) {
            case 1: // 吃
                oTableComp.doMahjongChi(
                    oChiPengGangPlayer.userId,
                    oAChiPengGang.tX,
                    oAChiPengGang.t0,
                    oAChiPengGang.t1,
                    oAChiPengGang.t2,
                    oAChiPengGang.fromUserId,
                );
                break;

            case 2: // 碰
                oTableComp.doMahjongPeng(
                    oChiPengGangPlayer.userId,
                    oAChiPengGang.tX,
                    oAChiPengGang.fromUserId,
                );
                break;
            
            case 3: // 明杠
                oTableComp.doMahjongMingGang(
                    oChiPengGangPlayer.userId,
                    oAChiPengGang.tX,
                    oAChiPengGang.fromUserId,
                );
                break;

            case 4: // 暗杠
                oTableComp.doMahjongAnGang(
                    oChiPengGangPlayer.userId,
                    oAChiPengGang.tX,
                    oChiPengGangPlayer.userId == UserData.getMyData().getUserId() ? 1 : 0,
                );
                break;

            case 5: // 补杠
                oTableComp.doMahjongBuGang(
                    oChiPengGangPlayer.userId,
                    oAChiPengGang.tX,
                );
                break;

            default:
                break;
        }
    }
}

/**
 * 麻将牌点击事件, 事件流:
 * MahjongTileOpComp --> MahjongInHandGroupComp --> MahjongTableComp --> MJ_weihai_Scene ( 当前类 )
 * 
 * @param SELF MJ_weihai_Scene.this
 * @param oTableComp 麻将牌桌组件
 * @param oMahjongTileOpNode 麻将牌操作节点
 */
function __onAMahjongTileClick(SELF: MJ_weihai_Scene, oTableComp: MahjongTableComp, oMahjongTileOpNode: cc.Node): void {
    if (null == SELF ||
        null == oTableComp ||
        null == oMahjongTileOpNode) {
        return;
    }

    // 获取当前操作组件
    let oCurrOpComp = oMahjongTileOpNode.getComponent(MahjongTileOpComp);

    if (null == oCurrOpComp) {
        return;
    }

    if (oCurrOpComp.getState() == 3) {
        MsgBus.getInstance().sendMsg(
            mod_MJ_weihai_Protocol.msg.MJ_weihai_MsgCodeDef._MahjongChuPaiCmd,
            mod_MJ_weihai_Protocol.msg.MahjongChuPaiCmd.create({
                t: oCurrOpComp.getVal(),
            })
        );
        return;
    }

    // 重制所有手中的麻将牌的状态
    oTableComp.resetAllMahjongInHandState();
    oCurrOpComp.setState(3);
    
    // 显示胡牌提示（根据玩法选择计算逻辑）
    __hintMahjongCanHu(SELF, oTableComp, oMahjongTileOpNode);
}

/**
 * 提示可以胡牌的麻将
 * 
 * @param SELF this 指针
 * @param oTableComp 麻将牌桌组件
 * @param oMahjongTileOpNode 麻将牌操作节点
 */
function __hintMahjongCanHu(SELF: MJ_weihai_Scene, oTableComp: MahjongTableComp, oMahjongTileOpNode: cc.Node): void {
    if (null == SELF ||
        null == oTableComp ||
        null == oMahjongTileOpNode) {
        return;
    }

    // 获取当前操作组件
    let oCurrOpComp = oMahjongTileOpNode.getComponent(MahjongTileOpComp);

    if (null == oCurrOpComp) {
        return;
    }

    // 获取用户 Id
    let nMyUserId = UserData.getMyData().getUserId();
    // 获取玩家手牌
    let oMahjongInHand = oTableComp.getMahjongInHand(nMyUserId);
    // 获取玩家摸到的牌
    let nMahjongMoPai = oTableComp.getMahjongMoPai(nMyUserId);

    if (null == oMahjongInHand || 
        oMahjongInHand.length <= 0 || 
        nMahjongMoPai <= 0) {
        return;
    }

    // 构建测试麻将列表
    let oTestMahjongValArray = [ 
        ...oMahjongInHand, nMahjongMoPai,
    ];

    // 准备打出的麻将所在位置
    let nPreOutputMahjongAtIndex = oTestMahjongValArray.indexOf(oCurrOpComp.getVal());

    if (-1 != nPreOutputMahjongAtIndex) {
        oTestMahjongValArray.splice(nPreOutputMahjongAtIndex, 1);
    }

    // 判断玩法模式，选择胡牌计算逻辑
    const oCachedRoom = CachedData.getInstance().get(CachingKeyDef.CACHED_ROOM);
    const bYiLaiDaoDi = oCachedRoom &&
        oCachedRoom.ruleSetting &&
        oCachedRoom.ruleSetting.getRuleValue(RuleKeyDef.KEY_PLAY_METHOD_YI_LAI_DAO_DI) == 1;
    
    let oCanHuMahjongArray: number[] = [];
    let nLaiZiTile: number = -1;  // 提升赖子牌变量到函数作用域
    
    if (bYiLaiDaoDi) {
        // 一赖到底模式：带赖子牌计算（完全依赖服务端下发）
        const oMyPlayer = oTableComp._oPlayerDataMap[nMyUserId];
        if (oMyPlayer) {
            nLaiZiTile = oMyPlayer.laiZiTile ?? -1;
            
            if (nLaiZiTile > 0) {
                oCanHuMahjongArray = HuCalculator.calcCanHuTilesWithLaiZi(oTestMahjongValArray, nLaiZiTile);
            } else {
                cc.warn(`[选牌预览] 赖子牌无效: ${nLaiZiTile}，使用普通胡牌计算`);
                oCanHuMahjongArray = HuFormula.getCanHuMahjongArray(oTestMahjongValArray);
            }
        } else {
            oCanHuMahjongArray = HuFormula.getCanHuMahjongArray(oTestMahjongValArray);
        }
    } else {
        // 非一赖到底模式：不带赖子牌计算
        oCanHuMahjongArray = HuFormula.getCanHuMahjongArray(oTestMahjongValArray);
    }

    let oHintAreaNode = cc.find("Canvas/InteractionArea/HintMahjongCanHuArea");

    if (oCanHuMahjongArray.length <= 0) {
        oHintAreaNode.active = false;
        return;
    }

    oCanHuMahjongArray = oCanHuMahjongArray.sort();
    let nI = 0;
    const MAX_COUNT = 8;

    for (; nI < oCanHuMahjongArray.length && nI < MAX_COUNT; nI++) {
        // 获取可以胡牌的麻将牌数值
        let nMahjongVal = oCanHuMahjongArray[nI];

        const oPatternNode = cc.find(`Pattern_${nI}_`, oHintAreaNode);
        if (oPatternNode) {
            const oValNode = cc.find(`MahjongTile/Val`, oPatternNode);
            if (oValNode) {
                const oSprite = oValNode.getComponent(cc.Sprite);
                if (oSprite) {
                    const oFrame = AllMahjongValImg.getSpriteFrame(nMahjongVal);
                    if (oFrame) {
                        oSprite.spriteFrame = oFrame;
                    }
                }
            }
            
            // 检查这张可胡的牌是否是赖子牌，如果是则添加赖子标记
            if (bYiLaiDaoDi && nLaiZiTile > 0 && nMahjongVal === nLaiZiTile) {
                __updateLaiZiMarkForHuHint(oPatternNode, true);
            } else {
                __updateLaiZiMarkForHuHint(oPatternNode, false);
            }
        }

        oPatternNode.active = true;
    }

    for (; nI < MAX_COUNT; nI++) {
        // 隐藏剩余的
        cc.find(`Pattern_${nI}_`, oHintAreaNode).active = false;
    }

    oHintAreaNode.active = true;
}

/**
 * 更新胡牌提示中赖子牌标记
 * 
 * @param oRootNode 根节点（麻将牌节点）
 * @param bIsLaiZi 是否是赖子牌
 */
function __updateLaiZiMarkForHuHint(oRootNode: cc.Node, bIsLaiZi: boolean): void {
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
