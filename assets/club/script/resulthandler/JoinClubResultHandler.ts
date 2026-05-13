//#region @import
import SuccezzHintFactory from "../../../comm/script/SuccezzHintFactory";
import MsgBus from "../../../comm/script/MsgBus";
import { mod_clubServerProtocol } from "../msg/AllMsg.ver_Club";
import JoinClubDialogComp from "../subview/JoinClubDialogComp";
//#endregion

/**
 * 加入亲友圈结果
 */
type IJoinClubResult = mod_clubServerProtocol.msg.IJoinClubResult;

/**
 * 加入亲友圈结果处理器
 */
export default class JoinClubResultHandler {
    /**
     * 处理结果
     * 
     * @param oResult 结果对象
     */
    static handle(oResult: IJoinClubResult): void {
        if (null == oResult) {
            cc.error("加入亲友圈结果为空");
            return;
        }

        if (oResult.succezz) {
            SuccezzHintFactory.getCreatedHint()
                .putSuccezzMsg("已发送申请，请等待圈主批准\n审核通过后会自动通知您")
                .renewDisplay();

            let oThatComp = cc.find("Canvas/SubViewPlaceHolder").getComponentInChildren(JoinClubDialogComp);

            if (null != oThatComp) {
                oThatComp.node.destroy();
            }
            
            // 刷新已加入俱乐部列表，以便显示新加入的俱乐部（状态为待审核）
            this.refreshJoinedClubList();
            
            // 注意：已改用服务端广播 ApprovalResultBroadcast 机制
            // 当管理员审核通过后，服务端会主动推送广播消息给客户端
        } else {
            // 加入失败，显示错误提示
            cc.warn(`加入亲友圈失败, clubId = ${oResult.clubId}`);
            SuccezzHintFactory.getCreatedHint()
                .putSuccezzMsg("加入失败，请检查亲友圈ID是否正确")
                .renewDisplay();
        }
    }
    
    /**
     * 刷新已加入俱乐部列表
     */
    private static refreshJoinedClubList(): void {
        // 发送获取已加入俱乐部列表的消息
        MsgBus.getInstance().sendMsg(
            mod_clubServerProtocol.msg.ClubServerMsgCodeDef._GetJoinedClubListCmd,
            mod_clubServerProtocol.msg.GetJoinedClubListCmd.create({})
        );
        
        cc.log("已刷新俱乐部列表");
    }
}
