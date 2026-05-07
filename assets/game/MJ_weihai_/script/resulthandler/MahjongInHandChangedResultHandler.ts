// @import
import MahjongTableComp from "../table/MahjongTableComp";
import UserData from "../../../../bizdata/script/UserData";
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";
import MJ_weihai_Scene from "../MJ_weihai_Scene";

/**
 * 麻将手牌变化结果
 */
type MahjongInHandChangedResult = mod_MJ_weihai_Protocol.msg.MahjongInHandChangedResult;

/**
 * 麻将手牌变化结果处理器
 */
export default class MahjongInHandChangedResultHandler {
    /**
     * 处理结果
     * 
     * @param oResult 结果对象
     */
    static handle(oResult: MahjongInHandChangedResult): void {
        if (null == oResult) {
            return;
        }

        // 添加详细调试日志
        cc.log(`========== MahjongInHandChangedResult ==========`);
        cc.log(`mahjongInHand = ${JSON.stringify(oResult.mahjongInHand)}`);
        cc.log(`moPai = ${oResult.moPai}`);
        cc.log(`laiGenTile = ${oResult.laiGenTile}`);
        cc.log(`laiZiTile = ${oResult.laiZiTile}`);
        cc.log(`完整对象 = ${JSON.stringify(oResult)}`);
        cc.log(`================================================`);

        // 获取牌桌组件
        let oTableComp = cc.find("Canvas/MahjongTableArea")?.getComponentInChildren(MahjongTableComp);

        if (null != oTableComp) {
            // 更新手牌（包含赖子牌信息）
            oTableComp.updateMahjongInHand(
                UserData.getMyData().getUserId(), 
                oResult.mahjongInHand, 
                oResult.moPai,
                0,  // nState
                oResult.laiGenTile,  // 赖子生成牌
                oResult.laiZiTile    // 赖子牌
            );
        }
        
        // 新增：手牌更新后，清除旧的胡牌提示
        // 服务端会在出牌后发送新的 MahjongChiPengGangHuOpHintResult 包含更新后的 huTileArray
        // 这里先清空，等待服务端新数据
        const oSceneNode = cc.find("Canvas");
        if (oSceneNode) {
            const oSceneComp = oSceneNode.getComponent(MJ_weihai_Scene);
            if (oSceneComp) {
                // 清空胡牌列表
                (oSceneComp as any)._oHuTileArray = [];
                // 隐藏胡牌提示区域
                const oHintArea = cc.find("Canvas/InteractionArea/HintMahjongCanHuArea");
                if (oHintArea) {
                    oHintArea.active = false;
                }
                cc.log(`[手牌更新] 清除旧的胡牌提示，等待服务端新数据`);
            }
        }
    }
}
