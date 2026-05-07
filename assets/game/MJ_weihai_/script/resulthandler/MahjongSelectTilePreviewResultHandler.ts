// @import
import MJ_weihai_Scene from "../MJ_weihai_Scene";
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";

/**
 * 选牌预览结果（一赖到底玩法）
 */
type MahjongSelectTilePreviewResult = mod_MJ_weihai_Protocol.msg.MahjongSelectTilePreviewResult;

/**
 * 选牌预览结果处理器
 * 处理服务端返回的选牌预览结果（一赖到底玩法）
 */
export default class MahjongSelectTilePreviewResultHandler {
    /**
     * 处理选牌预览结果
     * 
     * @param oResult 选牌预览结果
     */
    static handle(oResult: MahjongSelectTilePreviewResult): void {
        if (null == oResult) {
            return;
        }
        
        const nSelectTile = (oResult as any).selectTile ?? -1;
        const oHuTileArray = oResult.huTileArray || [];
        cc.log(`选牌预览结果, selectTile=${nSelectTile}, huTileArray=[${oHuTileArray.join(", ")}]`);
        
        // 通知Scene更新UI
        const oScene = cc.director.getScene()?.getComponentInChildren(MJ_weihai_Scene);
        if (oScene) {
            const nSelectTile = (oResult as any).selectTile ?? -1;
            oScene.showSelectTilePreview(nSelectTile, oResult.huTileArray || []);
        } else {
            cc.warn("找不到MJ_weihai_Scene组件，无法更新选牌预览UI");
        }
    }
}
