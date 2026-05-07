//#region @import
import MahjongChiPengGangGroupFactory from "./MahjongChiPengGangGroupFactory";
import MahjongSeatIndexer from "./MahjongSeatIndexer";
import MahjongTileOpComp from "./MahjongTileOpComp";
import PlayerInfoPaneComp from "./PlayerInfoPaneComp";
import { __addMahjongChiPengGangGroup } from "./__addMahjongChiPengGangGroup";
import { __addPlayer } from "./__addPlayer.ver_MJ_weihai_";
import { __checkChuPaiAndPlayAnim } from "./mwh0.__checkChuPaiAndPlayAnim";
import { __doMahjongChuPai } from "./__doMahjongChuPai";
import { __getMahjongInHandGroupCompOrElseCreate } from "./__getMahjongInHandGroupCompOrElseCreate";
import { __getMahjongOutputGroupCompOrElseCreate } from "./__getMahjongOutputGroupCompOrElseCreate";
import { __putPiaoXFlag } from "./__putPiaoXFlag";
import { __putZhuangJiaFlag } from "./__putZhuangJiaFlag";
import { __redirectActUserId } from "./__redirectActUserId";
import { __removePlayerByUserId } from "./__removePlayerByUserId.ver_MJ_weihai_";
import { __resetAllMahjongInHandState } from "./__resetAllMahjongInHandState";
import { __updateAllTotalScore } from "./__updateAllTotalScore";
import { __updateMahjongInHand } from "./__updateMahjongInHand";
import { __updateMahjongLiangFengGroup } from "./__updateMahjongLiangFengGroup";
import { __updateMahjongLiangGangDing } from "./__updateMahjongLiangGangDing";
import { __updateMahjongMoPai } from "./__updateMahjongMoPai";
import { __updateMahjongOutput } from "./__updateMahjongOutput";
//#endregion

// @const
const { ccclass } = cc._decorator;

/**
 * 玩家数据
 */
export type PlayerData = {
    /** 用户 Id */
    userId?: number,
    /** 用户名 */
    userName?: string,
    /** 头像 */
    headImg?: string,
    /** 性别 */
    sex?: number,
    /** 座位索引（服务端） */
    seatIndexAtServer?: number,
    /** 麻将手牌 */
    mahjongInHand?: Array<number>,
    /** 麻将摸牌 */
    mahjongMoPai?: number,
    /** 总分 */
    totalScore?: number,
    /** 飘几 */
    piaoX?: number,
    /** 赖子生成牌（墙牌最后一张） */
    laiGenTile?: number,
    /** 赖子牌（赖根牌+1） */
    laiZiTile?: number,
}

/**
 * 麻将牌桌组件
 */
@ccclass
export default class MahjongTableComp extends cc.Component {
    /**
     * 玩家数据字典
     */
    readonly _oPlayerDataMap: { [nUserId: number]: PlayerData } = {};

    /**
     * 最大玩家数量
     */
    _nMaxPlayer: number = 0;

    /**
     * 座位索引器
     */
    _oMahjongSeatIndexer?: MahjongSeatIndexer;

    // /**
    //  * onLoad
    //  */
    // onLoad(): void {
    // }

    /**
     * start
     */
    start(): void {
        // 注册 UI 事件
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
     * 初始化牌桌
     * 
     * @param nMaxPlayer 最大玩家数量
     */
    init(nMaxPlayer: number): MahjongTableComp {
        nMaxPlayer = Math.max(2, nMaxPlayer);
        nMaxPlayer = Math.min(4, nMaxPlayer);

        this._nMaxPlayer = nMaxPlayer;
        this._oMahjongSeatIndexer = new MahjongSeatIndexer(this._nMaxPlayer);
        return this;
    }

    /**
     * 添加玩家
     * 
     * @param oPlayerData 玩家数据
     * @param bIsFirst 是否是第一视角
     */
    addPlayer(oPlayerData: PlayerData, bIsFirst: boolean = false): void {
        __addPlayer(this, oPlayerData, bIsFirst);
    }

    /**
     * 根据用户 Id 移除一个玩家
     * 
     * @param nUserId 用户 Id
     */
    removePlayerByUserId(nUserId: number): void {
        __removePlayerByUserId(this, nUserId);
    }

    /**
     * 当选择一个玩家时
     * 
     * @param oCurrPlayer 当前玩家
     */
    onSelectedAPlayer(oCurrPlayer: PlayerData): void {
        if (null == oCurrPlayer) {
            return;
        }
    }

    /**
     * 更新麻将手牌
     * 
     * @param nUserId 用户 Id
     * @param oMahjongInHand 手中的麻将牌数值数组
     * @param nMoPai 麻将摸牌
     * @param nState 状态, 0 = 正常状态, 1 = 躺倒 ( 正面朝上 ), 2 = 躺倒 ( 背面朝上 ), 3 = 提起
     */
    updateMahjongInHand(
        nUserId: number,
        oMahjongInHand: Array<number>,
        nMoPai: number = -1,
        nState = 0,
        nLaiGenTile: number = -1,
        nLaiZiTile: number = -1
    ): void {
        __updateMahjongInHand(this, nUserId, oMahjongInHand, nMoPai, nState, nLaiGenTile, nLaiZiTile);
    }

    /**
     * 根据用户 Id 获取手中的麻将牌数值数组
     * 
     * @param nUserId 用户 Id
     * @return 手中的麻将牌数值数组
     */
    getMahjongInHand(nUserId: number): Array<number> {
        if (nUserId <= 0) {
            return [];
        }

        // 获取玩家
        let oPlayerData = this._oPlayerDataMap[nUserId];

        if (null == oPlayerData) {
            cc.error(`未找到玩家数据, userId = ${nUserId}`);
            return [];
        } else {
            return oPlayerData.mahjongInHand || [];
        }
    }

    /**
     * 更新麻将摸牌
     * 
     * @param nUserId 用户 Id
     * @param nMahjongMoPai 麻将摸牌
     * @param nState 状态
     */
    updateMahjongMoPai(
        nUserId: number,
        nMahjongMoPai: number,
        nState: number = 0,
        nLaiGenTile: number = -1,
        nLaiZiTile: number = -1
    ): void {
        __updateMahjongMoPai(this, nUserId, nMahjongMoPai, nState, nLaiGenTile, nLaiZiTile);
    }

    /**
     * 根据用户 Id 获取麻将摸牌
     * 
     * @param nUserId 用户 Id
     * @return 麻将摸牌
     */
    getMahjongMoPai(nUserId: number): number {
        if (nUserId <= 0) {
            return -1;
        }

        // 获取玩家
        let oPlayerData = this._oPlayerDataMap[nUserId];

        if (null == oPlayerData) {
            cc.error(`未找到玩家数据, userId = ${nUserId}`);
            return -1;
        } else {
            return oPlayerData.mahjongMoPai ?? -1;
        }
    }

    /**
     * 更新已打出的麻将牌数组
     * 
     * @param nUserId 用户 Id
     * @param oMahjongOutputArray 已打出的麻将牌数组
     */
    updateMahjongOutput(nUserId: number, oMahjongOutputArray: Array<number>): void {
        __updateMahjongOutput(this, nUserId, oMahjongOutputArray);
    }

    /**
     * 执行出牌
     * 
     * @param nUserId 用户 Id
     * @param nT 麻将牌
     */
    doMahjongChuPai(nUserId: number, nT: number): void {
        __doMahjongChuPai(this, nUserId, nT);
    }

    /**
     * 执行吃牌
     * 
     * @param nCmderUserId 命令用户 Id
     * @param nTChi 吃的是哪一张牌
     * @param nT0 第一张牌
     * @param nT1 第二张牌
     * @param nT2 第三张牌
     * @param nFromUserId 来自用户 Id
     */
    doMahjongChi(nCmderUserId: number, nTChi: number, nT0: number, nT1: number, nT2: number, nFromUserId: number): void {
        __addMahjongChiPengGangGroup(this, "chi", nCmderUserId, nTChi, nFromUserId, (nCmderSeatIndexAtClient, nFromSeatIndexAtClient) => {
            return MahjongChiPengGangGroupFactory.createChiGroup(
                nCmderSeatIndexAtClient, nTChi, nT0, nT1, nT2, nFromSeatIndexAtClient
            );
        });
    }

    /**
     * 执行碰牌
     * 
     * @param nCmderUserId 命令用户 Id
     * @param nT 麻将碰牌
     * @param nFromUserId 来自用户 Id
     */
    doMahjongPeng(nCmderUserId: number, nT: number, nFromUserId: number): void {
        __addMahjongChiPengGangGroup(this, "peng", nCmderUserId, nT, nFromUserId, (nCmderSeatIndexAtClient, nFromSeatIndexAtClient) => {
            return MahjongChiPengGangGroupFactory.createPengGroup(
                nCmderSeatIndexAtClient, nT, nFromSeatIndexAtClient
            );
        });
    }

    /**
     * 执行明杠
     * 
     * @param nCmderUserId 命令用户 Id
     * @param nT 麻将碰牌
     * @param nFromUserId 来自用户 Id
     * @param nSeq 发生次序
     */
    doMahjongMingGang(nCmderUserId: number, nT: number, nFromUserId: number): void {
        __addMahjongChiPengGangGroup(this, "mingGang", nCmderUserId, nT, nFromUserId, (nCmderSeatIndexAtClient, nFromSeatIndexAtClient) => {
            return MahjongChiPengGangGroupFactory.createMingGangGroup(
                nCmderSeatIndexAtClient, nT, nFromSeatIndexAtClient
            );
        });
    }

    /**
     * 执行暗杠
     * 
     * @param nCmderUserId 命令用户 Id
     * @param nT 暗杠麻将牌
     * @param nShow 是否展示? 1 = 展示, 0 = 不展示
     */
    doMahjongAnGang(nCmderUserId: number, nT: number, nShow: number = 0): void {
        __addMahjongChiPengGangGroup(this, "anGang", nCmderUserId, nT, nCmderUserId, (nCmderSeatIndexAtClient/*, nFromSeatIndexAtClient*/) => {
            return MahjongChiPengGangGroupFactory.createAnGangGroup(
                nCmderSeatIndexAtClient, nT, nShow
            );
        });
    }

    /**
     * 执行补杠
     * 
     * @param nCmderUserId 命令用户 Id
     * @param nT 补杠麻将牌
     */
    doMahjongBuGang(nCmderUserId: number, nT: number): void {
        __addMahjongChiPengGangGroup(this, "buGang", nCmderUserId, nT, nCmderUserId, (nCmderSeatIndexAtClient/*, nFromSeatIndexAtClient*/) => {
            return MahjongChiPengGangGroupFactory.createBuGangGroup(
                nCmderSeatIndexAtClient, nT
            );
        });
    }

    /**
     * 执行更新麻将亮风
     * 
     * @param nCmderUserId 命令用户 Id
     * @param nKind 亮风种类, 1 = 风牌, 2 = 箭牌, 3 = 乱锚
     * @param oCounterMap 计数器字典, key = 麻将牌面值, val = 数量
     */
    doUpdateMahjongLiangFeng(nCmderUserId: number, nKind: number, oCounterMap: { [nKey: number]: number, }): void {
        __updateMahjongLiangFengGroup(this, nCmderUserId, nKind, oCounterMap);
    }

    /**
     * 根据用户 Id 清除吃碰杠展示 ( 包括亮风 )
     * 
     * @param nUserId 用户 Id
     */
    clearChiPengGangByUserId(nUserId: number): void {
        if (nUserId <= 0) {
            return;
        }

        let oCurrPlayer = this._oPlayerDataMap[nUserId];

        if (null == oCurrPlayer) {
            return;
        }

        // 添加安全检查：确保 _oMahjongSeatIndexer 已初始化
        if (!this._oMahjongSeatIndexer) {
            cc.error("[clearChiPengGangByUserId] 座位索引器未初始化");
            return;
        }

        // 添加安全检查：确保 seatIndexAtServer 已定义
        if (oCurrPlayer.seatIndexAtServer === undefined) {
            cc.error("[clearChiPengGangByUserId] 玩家座位索引未定义");
            return;
        }

        let nSeatIndexAtClient = this._oMahjongSeatIndexer.getSeatIndexAtClient(oCurrPlayer.seatIndexAtServer);
        
        let oChiPengGangAreaNode = cc.find(
            `Seat_${nSeatIndexAtClient}_/MahjongChiPengGangArea`, 
            this.node
        );

        if (null != oChiPengGangAreaNode) {
            oChiPengGangAreaNode.removeAllChildren();
        }
    }

    /**
     * 重新定向活动用户 Id, 同时修改剩余卡牌数量
     * 
     * @param nUserId 用户 Id
     * @param nCurrRoundIndex 当前牌局索引
     * @param nRemainCardNum 剩余卡牌数量
     * @param nRemainTime 剩余时间, 单位 = 秒
     */
    redirectActUserId(nUserId: number, nCurrRoundIndex: number, nRemainCardNum: number, nRemainTime: number = -1): void {
        __redirectActUserId(this, nUserId, nCurrRoundIndex, nRemainCardNum, nRemainTime);
    }

    /**
     * 麻将牌点击事件, 事件流:
     * MahjongTileOpComp --> MahjongInHandGroupComp --> MahjongTableComp ( 当前类 )
     * 
     * @param oMahjongTileOpNode 麻将牌操作节点
     */
    onAMahjongTileClick(oMahjongTileOpNode: cc.Node): void {
        if (null == oMahjongTileOpNode) {
            cc.warn("[麻将牌点击] 节点为空");
            return;
        }
        
        // 获取麻将牌组件
        const oTileComp = oMahjongTileOpNode.getComponent(MahjongTileOpComp);
        if (!oTileComp) {
            cc.error("[麻将牌点击] 节点缺少 MahjongTileOpComp 组件");
            return;
        }
        
        // 获取牌值
        const nTileValue = oTileComp.getVal();
        cc.log(`[麻将牌点击] 事件触发，牌值: ${nTileValue}`);
        
        // TODO: 这里实现单击/双击逻辑
        // 目前先只输出日志，确认事件正常工作
        cc.log(`[麻将牌点击] 准备处理牌值: ${nTileValue}`);
    }

    /**
     * 重制所有手中的麻将牌的状态
     * 
     * @param nSeatIndexAtClient 客户端座位索引
     */
    resetAllMahjongInHandState(nSeatIndexAtClient: number = 0): void {
        __resetAllMahjongInHandState(this, nSeatIndexAtClient);
    }

    /**
     * 清理桌面, 将清理所有手牌、吃碰杠牌、已打出的牌
     */
    clearDesktop(): void {
        // 不显示指针区域
        cc.find("PointerArea", this.node).active = false;

        for (let nSeatIndex = 0; nSeatIndex < 4; nSeatIndex++) {
            // 不管是几人桌,
            // 默认都是按照 4 人桌进行清理
            let oNodeNameArray = [ 
                `Seat_${nSeatIndex}_/MahjongOutputArea`,
                `Seat_${nSeatIndex}_/MahjongChiPengGangArea`,
                `Seat_${nSeatIndex}_/MahjongInHandArea`,
            ];

            for (let strNodeName of oNodeNameArray) {
                // 查找座位节点
                let oSeatXNode = cc.find(strNodeName, this.node);
                
                if (null != oSeatXNode) {
                    oSeatXNode.removeAllChildren();
                }
            }
        }

        // 取消庄家标志
        this.putZhuangJiaFlag(-1);

        // 隐藏坠子
        // @see __updatePendant
        let oPendantNode = cc.find("Pendant", this.node);
        oPendantNode.active = false;
        cc.Tween.stopAllByTarget(oPendantNode);
    }

    /**
     * 获取展示动画的位置
     * 
     * @param nUserId 用户 Id
     * @return Cocos 节点
     */
    getShowAnimationPos(nUserId: number): cc.Node | undefined {
        if (nUserId <= 0) {
            return undefined;
        }

        // 获取玩家
        let oPlayerData = this._oPlayerDataMap[nUserId];

        if (null == oPlayerData) {
            cc.error(`未找到玩家数据, userId = ${nUserId}`);
            return undefined;
        }

        // 添加安全检查：确保 _oMahjongSeatIndexer 已初始化
        if (!this._oMahjongSeatIndexer) {
            cc.error(`[getShowAnimationPos] 座位索引器未初始化, userId = ${nUserId}`);
            return undefined;
        }

        // 添加安全检查：确保 seatIndexAtServer 已定义
        if (oPlayerData.seatIndexAtServer === undefined) {
            cc.error(`[getShowAnimationPos] 玩家座位索引未定义, userId = ${nUserId}`);
            return undefined;
        }

        // 获取客户端座位索引
        const nSeatIndexAtClient = this._oMahjongSeatIndexer.getSeatIndexAtClient(oPlayerData.seatIndexAtServer);
        return cc.find(`Seat_${nSeatIndexAtClient}_/ShowAnimationPos`, this.node);
    }

    /**
     * 设置庄家标志
     * 
     * @param nUserId 用户 Id
     * @return this 指针
     */
    putZhuangJiaFlag(nUserId: number): MahjongTableComp {
        __putZhuangJiaFlag(this, nUserId);
        return this;
    }

    /**
     * 设置飘几
     * 
     * @param nUserId 用户 Id
     * @param nPiaoX 飘几, -1 = 未知, 0 = 不飘, 1 = 飘_1, 2 = 飘_2, 3 = 飘_3, 4 = 飘_4
     * @return this 指针
     */
    putPiaoX(nUserId: number, nPiaoX: number): MahjongTableComp {
        __putPiaoXFlag(this, nUserId, nPiaoX);
        return this;
    }

    /**
     * 更新总分
     * 
     * @param oAllTotalScore 所有用户的总分
     * @return this 指针
     */
    updateAllTotalScore(oAllTotalScore: Array<{ userId: number, totalScore: number, }>): MahjongTableComp {
        __updateAllTotalScore(this, oAllTotalScore);
        return this;
    }

    /**
     * 更新麻将亮杠腚
     * 
     * @param nT0 第一张麻将牌
     * @param nT1 第二张麻将牌
     * @return this 指针
     */
    updateMahjongLiangGangDing(nT0: number, nT1: number): MahjongTableComp {
        __updateMahjongLiangGangDing(this, nT0, nT1);
        return this;
    }

    /**
     * 检查出牌并播放动画, 
     * XXX 注意: 只能在 0 号位置上播放动画,
     * 也就是自己的...
     * 
     * @param nChuPai 要出的麻将牌
     * @param nAtPos 所在位置
     * @param funCb 回调函数
     */
    checkChuPaiAndPlayAnim(
        nChuPai: number, nAtPos: number, funCb: (bSuccezz: boolean) => void): void {
        __checkChuPaiAndPlayAnim(this, nChuPai, nAtPos, funCb);
    }
}

///////////////////////////////////////////////////////////////////////

/**
 * 注册 UI 事件
 * 
 * @param SELF this 指针
 */
function __regUIEvent(SELF: MahjongTableComp): void {
    if (null == SELF) {
        return;
    }

    SELF.node.on(
        MahjongTileOpComp.EVENT_TOUCH_END, (oEvent: cc.Event.EventCustom) => {
            if (null == oEvent) {
                return;
            }

            // 不再继续冒泡
            oEvent.stopPropagation();

            if ("function" == typeof(SELF.onAMahjongTileClick)) {
                // 修复：使用 getUserData() 而不是 target
                const oTileNode = oEvent.getUserData() as cc.Node;
                
                // 添加节点有效性检查
                if (!oTileNode || !oTileNode.isValid) {
                    cc.warn("[麻将牌点击] 节点无效或已被销毁");
                    return;
                }
                
                cc.log(`[麻将牌点击] 事件处理器收到节点`);
                SELF.onAMahjongTileClick(oTileNode);
            }
        }
    );

    SELF.node.on(
        PlayerInfoPaneComp.EVENT_TOUCH_END, (oEvent: cc.Event.EventCustom) => {
            if (null == oEvent) {
                return;
            }

            // 不再继续冒泡
            oEvent.stopPropagation();

            if ("function" == typeof(SELF.onSelectedAPlayer)) {
                SELF.onSelectedAPlayer(oEvent.getUserData());
            }
        }
    );
}
