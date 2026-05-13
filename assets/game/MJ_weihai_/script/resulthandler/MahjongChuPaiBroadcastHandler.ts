// @import
import AudioMajordomo from "../../../../comm/script/AudioMajordomo";
import MahjongTableComp from "../table/MahjongTableComp";
import ModConfig from "../ModConfig.ver_MJ_weihai_";
import UserData from "../../../../bizdata/script/UserData";
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";

/**
 * 麻将出牌广播
 */
type MahjongChuPaiBroadcast = mod_MJ_weihai_Protocol.msg.MahjongChuPaiBroadcast;

/**
 * 麻将出牌广播处理器
 */
export default class MahjongChuPaiBroadcastHandler {
    /**
     * 处理结果
     * 
     * @param oBroadcast 广播对象
     */
    static handle(oBroadcast: MahjongChuPaiBroadcast): void {
        if (null == oBroadcast) {
            return;
        }

        if (oBroadcast.userId == UserData.getMyData().getUserId()) {
            // 如果是广播给自己,
            // 直接忽略...
            return;
        }

        cc.log(`其他玩家出牌, userId = ${oBroadcast.userId}, mahjongChuPai = ${oBroadcast.t}`);

        // 获取牌桌组件
        let oTableComp = cc.find("Canvas/MahjongTableArea").getComponentInChildren(MahjongTableComp);

        if (null == oTableComp) {
            return;
        }

        // 更新手牌
        oTableComp.doMahjongChuPai(
            oBroadcast.userId, oBroadcast.t
        );

        AudioMajordomo.getInstance().playSound(
            ModConfig.BUNDLE_NAME, 
            `res/1/audio/ChuPai`
        );

        let oUserData = UserData.getByUserId(oBroadcast.userId);

        if (null != oUserData) {
            let nSex = oUserData.getSafeSex();

            // 检查是否为赖子牌（飘赖）
            const nLaiZiTile = this._getLaiZiTile(oBroadcast.userId);
            const bIsPiaoLai = (nLaiZiTile > 0 && oBroadcast.t === nLaiZiTile);

            if (bIsPiaoLai) {
                // 飘赖出牌：播放特殊音效
                AudioMajordomo.getInstance().playVoice(
                    ModConfig.BUNDLE_NAME,
                    `res/1/audio/sex_${nSex}_/Round_PiaoLai_`
                );
            } else {
                // 普通出牌：播报牌名
                AudioMajordomo.getInstance().playVoice(
                    ModConfig.BUNDLE_NAME,
                    `res/1/audio/sex_${nSex}_/MahjongVal_${oBroadcast.t}_`
                );
            }
        }
    }

    /**
     * 获取指定玩家的赖子牌
     * 
     * @param nUserId 用户ID
     * @return 赖子牌值，-1表示未找到
     */
    private static _getLaiZiTile(nUserId: number): number {
        try {
            const oTableComp = cc.find("Canvas/MahjongTableArea")?.getComponentInChildren(MahjongTableComp);
            if (!oTableComp || !oTableComp._oPlayerDataMap) {
                return -1;
            }

            const oPlayerData = oTableComp._oPlayerDataMap[nUserId];
            if (!oPlayerData) {
                return -1;
            }

            return oPlayerData.laiZiTile || -1;
        } catch (e) {
            cc.error(`[飘赖] 获取赖子牌失败: ${e}`);
            return -1;
        }
    }
}
