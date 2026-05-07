// @import
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";

/**
 * 飘赖结果
 */
type MahjongPiaoLaiResult = mod_MJ_weihai_Protocol.msg.MahjongPiaoLaiResult;

/**
 * 飘赖结果处理器
 */
export default class MahjongPiaoLaiResultHandler {
    /**
     * 处理结果
     * 
     * @param oResult 结果对象
     */
    static handle(oResult: MahjongPiaoLaiResult): void {
        if (null == oResult) {
            return;
        }

        cc.log(`飘赖结果, laiZiTile = ${oResult.laiZiTile}, ok = ${oResult.ok}`);

        if (!oResult.ok) {
            cc.warn("飘赖失败");
        }
    }
}