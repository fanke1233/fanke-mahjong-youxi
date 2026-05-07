// @import
import { mod_MJ_weihai_Protocol } from "../msg/AllMsg.ver_MJ_weihai_";
import UserData from "../../../../bizdata/script/UserData";
import SuccezzHintFactory from "../../../../comm/script/SuccezzHintFactory";
import MsgBus from "../../../../comm/script/MsgBus";

/**
 * 飘赖广播
 */
type MahjongPiaoLaiBroadcast = mod_MJ_weihai_Protocol.msg.MahjongPiaoLaiBroadcast;

/**
 * 飘赖广播处理器
 */
export default class MahjongPiaoLaiBroadcastHandler {
    /**
     * 处理结果
     * 
     * @param oBroadcast 广播对象
     */
    static handle(oBroadcast: MahjongPiaoLaiBroadcast): void {
        if (null == oBroadcast) {
            return;
        }

        cc.log(`========== MahjongPiaoLaiBroadcast ==========`);
        cc.log(`玩家飘赖, userId = ${oBroadcast.userId}`);
        cc.log(`赖子牌 = ${oBroadcast.laiZiTile}`);
        cc.log(`补牌 = ${oBroadcast.buPaiTile}`);
        cc.log(`ok = ${oBroadcast.ok}`);

        // 获取玩家名称
        let strPlayerName = "未知玩家";
        let oUserData = UserData.getByUserId(oBroadcast.userId);
        if (null != oUserData) {
            strPlayerName = oUserData.getUserName();
        }

        // 构建友好的提示信息（不使用"错误"字样）
        let strMessage = `${strPlayerName} 飘出赖子`;
        
        // 使用成功提示组件显示消息（避免显示"错误"前缀）
        let oSuccezzHint = SuccezzHintFactory.getCreatedHint();
        if (null != oSuccezzHint) {
            oSuccezzHint.putSuccezzMsg(strMessage).renewDisplay();
        } else {
            // 如果提示组件未初始化,至少记录日志
            cc.log(strMessage);
        }

        // 处理补牌逻辑
        if (oBroadcast.buPaiTile > 0) {
            cc.log(`处理补牌: ${oBroadcast.buPaiTile}`);
            
            // 获取当前用户的ID
            let nCurrUserId = UserData.getMyData().getUserId();
            
            // 如果是当前玩家飘赖,需要更新手牌
            if (oBroadcast.userId === nCurrUserId) {
                cc.log(`当前玩家飘赖,需要更新手牌`);
                
                // 发送同步房间数据请求,获取最新的手牌信息
                MsgBus.getInstance().sendMsg(
                    mod_MJ_weihai_Protocol.msg.MJ_weihai_MsgCodeDef._SyncRoomDataCmd,
                    mod_MJ_weihai_Protocol.msg.SyncRoomDataCmd.create({})
                );
            }
        }
        
        cc.log(`=============================================`);
    }
}
