// @import
import MJ_weihai_Scene from "../MJ_weihai_Scene";
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";

/**
 * 麻将吃碰杠胡操作提示结果
 */
type MahjongChiPengGangHuOpHintResult = mod_MJ_weihai_Protocol.msg.MahjongChiPengGangHuOpHintResult;

/**
 * 麻将吃碰杠胡操作提示结果处理器
 */
export default class MahjongChiPengGangHuOpHintResultHandler {
    /**
     * 处理结果
     * 
     * @param oResult 结果对象
     */
    static handle(oResult: MahjongChiPengGangHuOpHintResult): void {
        if (null == oResult) {
            return;
        }

        let oDebugStrArray = [];
        oDebugStrArray.push(`canChi = ${oResult.opHintChi}`);
        oDebugStrArray.push(`canPeng = ${oResult.opHintPeng}`);
        oDebugStrArray.push(`canGang = ${oResult.opHintGang}`);
        oDebugStrArray.push(`canHu = ${oResult.opHintHu}`);
        oDebugStrArray.push(`canLiangFeng = ${oResult.opHintLiangFeng}`);
        oDebugStrArray.push(`canBuFeng = ${oResult.opHintBuFeng}`);
        // 飘赖功能已改为出牌时自动触发,不再使用opHintPiaoLai字段
        // oDebugStrArray.push(`canPiaoLai = ${oResult.opHintPiaoLai}`);
        
        // 记录见字胡提示状态
        if (oResult.jianZiHuHint !== undefined && oResult.jianZiHuHint !== null) {
            oDebugStrArray.push(`jianZiHuHint = ${oResult.jianZiHuHint}`);
        }
        
        // 记录胡牌列表
        if (oResult.huTileArray !== undefined && oResult.huTileArray !== null) {
            oDebugStrArray.push(`huTileArray = [${oResult.huTileArray.join(", ")}]`);
        } else {
            oDebugStrArray.push(`huTileArray = undefined/null`);
        }

        cc.log(`吃碰杠胡提示, ${oDebugStrArray.join(", ")}`);

        // 显示吃碰杠胡操作提示（传递jianZiHuHint参数）
        cc.find("Canvas/Script").getComponent(MJ_weihai_Scene).showChiPengGangHuOpHint(oResult);
    }
}
