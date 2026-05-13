//#region @import
import SuccezzHintFactory from "../../../comm/script/SuccezzHintFactory";
import MsgBus from "../../../comm/script/MsgBus";
import { mod_clubServerProtocol } from "../msg/AllMsg.ver_Club";
//#endregion

/**
 * 审核结果广播消息
 */
type IApprovalResultBroadcast = mod_clubServerProtocol.msg.IApprovalResultBroadcast;

/**
 * 审核结果广播消息处理器
 */
export default class ApprovalResultBroadcastHandler {
    /**
     * 处理广播消息
     * 
     * @param oBroadcast 广播消息对象
     */
    static handle(oBroadcast: IApprovalResultBroadcast): void {
        if (null == oBroadcast) {
            cc.error("审核结果广播消息为空");
            return;
        }

        cc.log(`收到审核结果广播: userId=${oBroadcast.userId}, clubId=${oBroadcast.clubId}, approved=${oBroadcast.approved}`);

        if (oBroadcast.approved) {
            // 审核通过
            this.handleApprovalSuccess(oBroadcast);
        } else {
            // 审核拒绝
            this.handleApprovalRejected(oBroadcast);
        }
    }

    /**
     * 处理审核通过
     * 
     * @param oBroadcast 广播消息
     */
    private static handleApprovalSuccess(oBroadcast: IApprovalResultBroadcast): void {
        const strClubName = oBroadcast.clubName || "未知俱乐部";
        
        // 显示成功提示
        SuccezzHintFactory.getCreatedHint()
            .putSuccezzMsg(`恭喜！您已成功加入【${strClubName}】`)
            .renewDisplay();

        cc.log(`用户 ${oBroadcast.userId} 已加入俱乐部 ${oBroadcast.clubId} (${strClubName})`);

        // 刷新已加入俱乐部列表
        this.refreshJoinedClubList();

        // 自动跳转到俱乐部详情页（优化用户体验）
        const nClubId = Number(oBroadcast.clubId) || 0;
        if (nClubId > 0) {
            this.autoEnterClubDetail(nClubId);
        }
    }

    /**
     * 处理审核拒绝
     * 
     * @param oBroadcast 广播消息
     */
    private static handleApprovalRejected(oBroadcast: IApprovalResultBroadcast): void {
        const strClubName = oBroadcast.clubName || "该俱乐部";
        
        // 显示拒绝提示
        SuccezzHintFactory.getCreatedHint()
            .putSuccezzMsg(`很遗憾，您的加入申请被【${strClubName}】拒绝了`)
            .renewDisplay();

        cc.warn(`用户 ${oBroadcast.userId} 加入俱乐部 ${oBroadcast.clubId} 的申请被拒绝`);
    }

    /**
     * 刷新已加入俱乐部列表
     */
    private static refreshJoinedClubList(): void {
        MsgBus.getInstance().sendMsg(
            mod_clubServerProtocol.msg.ClubServerMsgCodeDef._GetJoinedClubListCmd,
            mod_clubServerProtocol.msg.GetJoinedClubListCmd.create({})
        );
        
        cc.log("已刷新俱乐部列表");
    }

    /**
     * 自动进入俱乐部详情（可选功能）
     * 
     * @param nClubId 俱乐部ID
     */
    private static autoEnterClubDetail(nClubId: number): void {
        if (!nClubId || nClubId <= 0) {
            return;
        }

        // 发送获取俱乐部详情的消息
        MsgBus.getInstance().sendMsg(
            mod_clubServerProtocol.msg.ClubServerMsgCodeDef._GetClubDetailzCmd,
            mod_clubServerProtocol.msg.GetClubDetailzCmd.create({
                clubId: nClubId,
            })
        );

        cc.log(`自动进入俱乐部 ${nClubId} 的详情页`);
    }
}
