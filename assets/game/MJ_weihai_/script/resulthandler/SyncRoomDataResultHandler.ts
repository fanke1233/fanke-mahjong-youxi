// @import
import LoadingWndFactory from "../../../../comm/script/LoadingWndFactory";
import MJ_weihai_Scene from "../MJ_weihai_Scene";
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";

/**
 * 同步房间数据结果
 */
type SyncRoomDataResult = mod_MJ_weihai_Protocol.msg.SyncRoomDataResult;

/**
 * 同步房间数据结果处理器
 */
export default class SyncRoomDataResultHandler {
    /**
     * 处理结果
     * 
     * @param oResult 结果对象
     */
    static handle(oResult: SyncRoomDataResult): void {
        if (null == oResult) {
            return;
        }

        cc.log(`同步房间数据, result = ${JSON.stringify(oResult)}`);
        
        // 添加调试日志：追踪player数据
        cc.log(`[赖子牌追踪] ====== SyncRoomDataResult 原始数据 ======`);
        cc.log(`[赖子牌追踪] 结果对象类型: ${typeof oResult}`);
        cc.log(`[赖子牌追踪] oResult.player 是否存在: ${!!oResult.player}`);
        cc.log(`[赖子牌追踪] oResult.player 类型: ${typeof oResult.player}`);
        cc.log(`[赖子牌追踪] oResult.player 长度: ${oResult.player ? oResult.player.length : 0}`);
        
        if (oResult.player && oResult.player.length > 0) {
            for (let i = 0; i < oResult.player.length; i++) {
                const oPlayer = oResult.player[i];
                cc.log(`[赖子牌追踪] Player[${i}] 原始对象:`, oPlayer);
                cc.log(`[赖子牌追踪] Player[${i}] laiGenTile: ${oPlayer.laiGenTile}`);
                cc.log(`[赖子牌追踪] Player[${i}] laiZiTile: ${oPlayer.laiZiTile}`);
                cc.log(`[赖子牌追踪] Player[${i}] 所有字段: ${Object.keys(oPlayer).join(', ')}`);
            }
        }
        cc.log(`[赖子牌追踪] ========================================`);

        // 更新麻将牌桌
        cc.find("Canvas/Script")
            .getComponent(MJ_weihai_Scene)
            .updateMahjongTable(oResult);

        // 隐藏加载窗口
        LoadingWndFactory.getCreatedWnd().hide();
    }
}
