// @import
import MahjongTableComp from "./MahjongTableComp";
import { __getMahjongInHandGroupCompOrElseCreate } from "./__getMahjongInHandGroupCompOrElseCreate";
import { __updateMahjongMoPai } from "./__updateMahjongMoPai";

/**
 * 更新麻将手牌
 * 
 * @param SELF this 指针
 * @param nUserId 用户 Id
 * @param oMahjongInHand 手中的麻将牌数值数组
 * @param nMoPai 麻将摸牌
 * @param nState 状态, 0 = 正常状态, 1 = 躺倒 ( 正面朝上 ), 2 = 躺倒 ( 背面朝上 ), 3 = 提起
 * @param nLaiGenTile 赖子生成牌 (一赖到底玩法)
 * @param nLaiZiTile 赖子牌 (一赖到底玩法)
 */
export function __updateMahjongInHand(
    SELF: MahjongTableComp, 
    nUserId: number, 
    oMahjongInHand: Array<number>, 
    nMoPai: number = -1, 
    nState = 0,
    nLaiGenTile: number = -1,
    nLaiZiTile: number = -1
): void {
    if (null == SELF ||
        nUserId <= 0) {
        return;
    }

    // 获取玩家
    let oPlayerData = SELF._oPlayerDataMap[nUserId];

    if (null == oPlayerData) {
        cc.error(`未找到玩家数据, userId = ${nUserId}`);
        return;
    }

    // 更新手中的麻将牌数值数组
    oPlayerData.mahjongInHand = oMahjongInHand;
    
    // 更新玩家赖子牌信息（完全依赖服务端下发）
    if (nLaiGenTile > 0) {
        oPlayerData.laiGenTile = nLaiGenTile;
    }
    if (nLaiZiTile > 0) {
        oPlayerData.laiZiTile = nLaiZiTile;
    }

    // 获取客户端座位索引
    const nSeatIndexAtClient = SELF._oMahjongSeatIndexer?.getSeatIndexAtClient(oPlayerData.seatIndexAtServer ?? -1) ?? -1;

    // 获取手牌分组组件
    const oGroupComp = __getMahjongInHandGroupCompOrElseCreate(
        SELF, nSeatIndexAtClient
    );

    if (null != oGroupComp) {
        oGroupComp.putCanInteractive(0 == nSeatIndexAtClient)
            .updateMahjongInHand(oMahjongInHand, nState, nLaiGenTile, nLaiZiTile);
    }

    // 关键修复：只有在 moPai 有效时才更新摸牌
    // 如果 moPai <= 0，说明没有摸牌，应该清空摸牌区
    if (nMoPai > 0) {
        __updateMahjongMoPai(SELF, nUserId, nMoPai, nState, nLaiGenTile, nLaiZiTile);
    } else {
        // 没有摸牌时，清空摸牌区
        if (null != oGroupComp) {
            oGroupComp.clearMahjongMoPai();
        }
    }
}