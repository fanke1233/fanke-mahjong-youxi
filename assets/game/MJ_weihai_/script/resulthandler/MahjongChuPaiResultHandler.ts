// @import
import AudioMajordomo from "../../../../comm/script/AudioMajordomo";
import MahjongTableComp from "../table/MahjongTableComp";
import ModConfig from "../ModConfig.ver_MJ_weihai_";
import UserData from "../../../../bizdata/script/UserData";
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";

/**
 * 麻将出牌结果
 */
type MahjongChuPaiResult = mod_MJ_weihai_Protocol.msg.MahjongChuPaiResult;

/**
 * 麻将手牌变化结果处理器
 */
export default class MahjongChuPaiResultHandler {
    /**
     * 处理结果
     * 
     * @param oResult 结果对象
     */
    static handle(oResult: MahjongChuPaiResult): void {
        if (null == oResult) {
            return;
        }

        cc.log(`我自己出牌, mahjongChuPai = ${oResult.t}`);

        // 获取牌桌组件
        let oTableComp = cc.find("Canvas/MahjongTableArea").getComponentInChildren(MahjongTableComp);

        if (null == oTableComp) {
            return;
        }

        // 更新手牌
        oTableComp.doMahjongChuPai(
            UserData.getMyData().getUserId(), 
            oResult.t
        );

        AudioMajordomo.getInstance().playSound(
            ModConfig.BUNDLE_NAME, 
            `res/1/audio/ChuPai`
        );

        // 检查是否为赖子牌（飘赖）
        const nMyUserId = UserData.getMyData().getUserId();
        const nSafeSex = UserData.getMyData().getSafeSex();
        const nLaiZiTile = this._getLaiZiTile(nMyUserId);
        const bIsPiaoLai = (nLaiZiTile > 0 && oResult.t === nLaiZiTile);

        if (bIsPiaoLai) {
            // 飘赖出牌：播放特殊音效
            AudioMajordomo.getInstance().playVoice(
                ModConfig.BUNDLE_NAME,
                `res/1/audio/sex_${nSafeSex}_/Round_PiaoLai_`
            );
        } else {
            // 普通出牌：播报牌名
            AudioMajordomo.getInstance().playVoice(
                ModConfig.BUNDLE_NAME,
                `res/1/audio/sex_${nSafeSex}_/MahjongVal_${oResult.t}_`
            );
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
