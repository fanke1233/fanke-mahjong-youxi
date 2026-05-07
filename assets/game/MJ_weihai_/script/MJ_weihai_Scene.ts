//#region @import
import AppSetting from "../../../bizdata/script/AppSetting";
import AudioMajordomo from "../../../comm/script/AudioMajordomo";
import CachingKeyDef from "../../../bizdata/script/CachingKeyDef";
import CachedData from "../../../bizdata/script/CachedData";
import ErrorHintFactory from "../../../comm/script/ErrorHintFactory";
import GlobalDef from "../../../comm/script/GlobalDef";
import LocalBrowser from "../../../comm/script/LocalBrowser";
import ModConfig from "./ModConfig.ver_MJ_weihai_";
import MsgBus from "../../../comm/script/MsgBus";
import MsgRecognizer from "../../../comm/script/MsgRecognizer";
import PlayerInfoDialogComp from "./subview/PlayerInfoDialogComp";
import RoomInfoDialogComp from "./subview/RoomInfoDialogComp";
import RuleKeyDef from "../../../bizdata/script/RuleKeyDef";
import RuleSetting from "./RuleSetting";
import UserData from "../../../bizdata/script/UserData";
import Ver from "../../../comm/script/Ver";
import AllMahjongValImg from "./AllMahjongValImg";
import MahjongTileDef from "./MahjongTileDef";
import MahjongInHandGroupComp from "./table/MahjongInHandGroupComp";
import MahjongTableComp from "./table/MahjongTableComp";
import MahjongTileOpComp from "./table/MahjongTileOpComp";
import { __createMahjongTable } from "./__createMahjongTable";
import { __onMsgHandler } from "./resulthandler/__onMsgHandler.ver_MJ_weihai_";
import { __regUIEvent } from "./__regUIEvent.ver_MJ_weihai_";
import { mod_chatServerProtocol, mod_MJ_weihai_Protocol } from "./msg/AllMsg.ver_MJ_weihai_";
import HuCalculator from "./HuCalculator";
import HuFormula from "./hupattern/HuFormula";
//#endregion

// @const
const { ccclass } = cc._decorator;
const BG_MUSIC = "res/1/audio/BGMusic_Mahjong_";

/**
 * 吃碰杠胡操作提示参数
 */
type ChiPengGangHuOpHintParam = mod_MJ_weihai_Protocol.msg.MahjongChiPengGangHuOpHintResult

/**
 * 同步房间数据结果
 */
type ISyncRoomDataResult = mod_MJ_weihai_Protocol.msg.ISyncRoomDataResult;

type RuleItem = {
    key?: number,
    val?: number,
};

function normalizeRuleItemArray(oRuleItemArray: Array<mod_MJ_weihai_Protocol.msg.IKeyAndVal> | null | undefined): Array<RuleItem> {
    if (!Array.isArray(oRuleItemArray) || oRuleItemArray.length <= 0) {
        return [];
    }

    const oNormalizedRuleItemArray: Array<RuleItem> = [];

    for (let oRuleItem of oRuleItemArray) {
        if (null == oRuleItem) {
            continue;
        }

        oNormalizedRuleItemArray.push({
            key: oRuleItem.key ?? undefined,
            val: oRuleItem.val ?? undefined,
        });
    }

    return oNormalizedRuleItemArray;
}

/**
 * 仙桃麻将场景
 */
@ccclass
export default class MJ_weihai_Scene extends cc.Component {
    /**
     * 房间号
     */
    _nRoomId: number = -1;

    /**
     * 房主用户 Id
     */
    _nRoomOwnerId: number = -1;

    /**
     * 当前牌局索引
     */
    _nCurrRoundIndex: number = -1;
    
    /**
     * 最大玩家数量
     */
    _nMaxPlayer: number = 2;

    /**
     * 见字胡状态（一赖到底玩法）
     * true = 处于见字胡状态，不能胡牌
     */
    _bJianZiHuState: boolean = false;

    /**
     * 胡牌牌面列表（一赖到底玩法）
     * 存储可以胡的牌面数值
     */
    _oHuTileArray: Array<number> = [];

    /**
     * 选牌预览：当前选择的牌（一赖到底玩法）
     */
    _nSelectTilePreview: number = -1;

    /**
     * 选牌预览：如果打出选择的牌后可以胡的牌列表（一赖到底玩法）
     */
    _oSelectTilePreviewHuArray: Array<number> = [];

    /**
     * 缓存手牌区域节点
     */
    _oMahjongInHandAreaNode: cc.Node | null = null;

    /**
     * 缓存预览显示区域节点
     */
    _oSelectTilePreviewAreaNode: cc.Node | null = null;

    /**
     * 缓存预览的麻将牌模板根节点
     */
    _oSelectTilePreviewTemplateRoot: cc.Node | null = null;

    /**
     * 缓存预览的麻将牌模板节点
     */
    _oSelectTilePreviewTemplateNode: cc.Node | null = null;

    /**
     * 预览模板加载重试次数
     */
    _nSelectTilePreviewTemplateLoadRetry: number = 0;

    /**
     * onLoad
     */
    onLoad(): void {
        let oCanvasNode = cc.find("Canvas");
        let nCanvasW = oCanvasNode.width;

        if (nCanvasW < GlobalDef._nStandardScreenWidth) {
            oCanvasNode.scale = (nCanvasW / GlobalDef._nStandardScreenWidth);
        }

        // 安全添加组件
        const oRoomInfoNode = cc.find("Canvas/SubViewPlaceHolder/RoomInfoDialog");
        if (oRoomInfoNode) {
            oRoomInfoNode.addComponent(RoomInfoDialogComp);
        }

        const oPlayerInfoNode = cc.find("Canvas/SubViewPlaceHolder/PlayerInfoDialog");
        if (oPlayerInfoNode) {
            oPlayerInfoNode.addComponent(PlayerInfoDialogComp);
        }
    }

    /**
     * start
     */
    start(): void {
        if (!CC_DEBUG) {
            cc.log = (oMsg: any): void => {
                console.log(oMsg);
            }

            cc.error = (oError: any): void => {
                console.error(oError);
            }

            cc.warn = (oMsg: any): void => {
                console.warn(oMsg);
            }

            cc.log("重新定义 log()、error()、warn() 函数");
        }

        // 添加协议
        MsgRecognizer.addProtocol("MJ_weihai_", mod_MJ_weihai_Protocol);
        MsgRecognizer.addProtocol("chat", mod_chatServerProtocol);

    

        // 获取规则设置
        let oRuleItemArray = CachedData.getInstance().get(CachingKeyDef.RULE_ITEM_ARRAY);

        if (null == oRuleItemArray) {
            cc.error("房间规则设置为空");
            return;
        }

        // 创建规则设置
        let oRuleSetting = new RuleSetting(oRuleItemArray);
        this._nMaxPlayer = oRuleSetting.getMaxPlayer();

        // 消息处理
        __onMsgHandler(this);
        // 注册 UI 事件
        __regUIEvent(this, oRuleSetting);

        // 同步房间数据
        MsgBus.getInstance().sendMsg(
            mod_MJ_weihai_Protocol.msg.MJ_weihai_MsgCodeDef._SyncRoomDataCmd, 
            mod_MJ_weihai_Protocol.msg.SyncRoomDataCmd.create({
            })
        );

        // 发送已准备好指令
        MsgBus.getInstance().sendMsg(
            mod_MJ_weihai_Protocol.msg.MJ_weihai_MsgCodeDef._PrepareCmd,
            mod_MJ_weihai_Protocol.msg.PrepareCmd.create({ 
                yes: 1,
            })
        );

        // 播放背景音乐
        AudioMajordomo.getInstance().playBGMusic(
            ModConfig.BUNDLE_NAME, 
            BG_MUSIC, 
            AppSetting.getInstance()._bEnableBGMusic
        );

        // 加载完场景之后, 先不要撤掉进度条窗口!
        // 等待同步房间数据完成之后再撤掉...
        // @see SyncRoomDataResultHandler
        //LoadingWndFactory.getCreatedWnd().hide();

        // 设置版本号
        const oVerLabelNode = cc.find("Canvas/Label_Ver_");
        if (oVerLabelNode) {
            const oVerLabel = oVerLabelNode.getComponent(cc.Label);
            if (oVerLabel) {
                oVerLabel.string = Ver._strCurr;
            }
        }

        let funReportGeoLocation = () => {
            LocalBrowser.getGeoLocation((oGeoCoordz) => {
                if (null == oGeoCoordz) {
                    oGeoCoordz = {
                        latitude: 0,
                        longitude: 0,
                        altitude: 0,
                    };
                }

                // 通过消息汇报地理位置
                MsgBus.getInstance().sendMsg(
                    mod_MJ_weihai_Protocol.msg.MJ_weihai_MsgCodeDef._ReportGeoLocationCmd,
                    mod_MJ_weihai_Protocol.msg.ReportGeoLocationCmd.create({
                        latitude: oGeoCoordz.latitude,
                        longitude: oGeoCoordz.longitude,
                        altitude: oGeoCoordz.altitude,
                        clientIpAddr: "", // 有 proxyServer 来填充
                    })
                );
            });
        }

        funReportGeoLocation();
        this.schedule(funReportGeoLocation, 30, cc.macro.REPEAT_FOREVER);
    }

    // /**
    //  * update
    //  * 
    //  * @param nDeltaTime 变化时间
    //  */
    // update (nDeltaTime: number): void {
    // }

    /**
     * onDestroy
     */
    onDestroy(): void {
        MsgRecognizer.removeProtocolByName("MJ_weihai_");
        MsgRecognizer.removeProtocolByName("chat");
    }

    /**
     * 设置当前牌局索引
     * 
     * @param nVal 整数值
     */
    putCurrRoundIndex(nVal: number): MJ_weihai_Scene {
        this._nCurrRoundIndex = nVal;
        return this;
    }

    /**
     * 更新麻将牌桌
     * 
     * @param oSyncRoomDataResult 同步房间数据结果
     */
    updateMahjongTable(oSyncRoomDataResult: ISyncRoomDataResult): void {
        if (null == oSyncRoomDataResult || 
            null == oSyncRoomDataResult.ruleItem) {
            return;
        }

        // 创建规则设置
        let oRuleSetting = new RuleSetting(
            normalizeRuleItemArray(oSyncRoomDataResult.ruleItem)
        );

        // 设置房间 Id 和当前牌局索引
        this._nRoomId = oSyncRoomDataResult.roomId ?? -1;
        this._nCurrRoundIndex = oSyncRoomDataResult.currRoundIndex ?? -1;
        // 设置房主用户 Id
        this._nRoomOwnerId = oSyncRoomDataResult.roomOwnerId ?? -1;
        // 设置最大玩家数量
        this._nMaxPlayer = oRuleSetting.getMaxPlayer();

        if (this._nCurrRoundIndex >= 0) {
            // 如果已经开局就隐藏解散和要求按钮
            this.hideInvite();
        }

        // 缓存数据
        __doCaching(oRuleSetting, oSyncRoomDataResult);

        // 更新房间信息面板
        this.initRoomInfoDialog(
            oRuleSetting, 
            oSyncRoomDataResult
        );

        __createMahjongTable(
            this, this._nMaxPlayer, oSyncRoomDataResult
        );
    }

    /**
     * 更新规则设置面板
     * 
     * @param oRuleSetting 规则设置
     * @param oSyncRoomDataResult 同步房间数据结果
     */
    private initRoomInfoDialog(oRuleSetting: RuleSetting, oSyncRoomDataResult: any): void {
        if (null == oRuleSetting || 
            null == oSyncRoomDataResult) {
            return;
        }

        // 设置当前牌局索引
        this._nCurrRoundIndex = oSyncRoomDataResult.currRoundIndex;

        // 安全更新房间ID标签
        const oRoomIdNode = cc.find("Canvas/RoomIdArea/CurrRoomId");
        if (oRoomIdNode) {
            const oRoomIdLabel = oRoomIdNode.getComponent(cc.Label);
            if (oRoomIdLabel) {
                oRoomIdLabel.string = "房" + oSyncRoomDataResult.roomId;
            }
        }

        // 安全更新房间信息对话框
        const oRoomInfoNode = cc.find("Canvas/SubViewPlaceHolder/RoomInfoDialog");
        if (oRoomInfoNode) {
            const oRoomInfoComp = oRoomInfoNode.getComponent(RoomInfoDialogComp);
            if (oRoomInfoComp) {
                oRoomInfoComp
                    .putRoomId(oSyncRoomDataResult.roomId)
                    .putMaxPlayerAndMaxRoundDesc(oRuleSetting.getMaxPlayerAndMaxRoundDesc())
                    .putPaymentWayDesc(oRuleSetting.getPaymentWayDesc())
                    .putPlayMethodDesc(oRuleSetting.getPlayMethodDesc())
                    .renewDisplay();
            }
        }
    }

    /**
     * 显示用户信息面板
     * 
     * @param oPlayerData 用户信息
     */
    showPlayerInfoDialog(oPlayerData: any): void {
        if (null == oPlayerData) {
            return;
        }

        let bCanFireAPlayer = this._nCurrRoundIndex < 0 
            && UserData.getMyData().getUserId() == this._nRoomOwnerId
            && UserData.getMyData().getUserId() != oPlayerData["userId"]; // 不能踢出自己

        // 安全显示玩家信息对话框
        const oPlayerInfoNode = cc.find("Canvas/SubViewPlaceHolder/PlayerInfoDialog");
        if (oPlayerInfoNode) {
            oPlayerInfoNode.active = true;
            const oPlayerInfoComp = oPlayerInfoNode.getComponent(PlayerInfoDialogComp);
            if (oPlayerInfoComp) {
                oPlayerInfoComp
                    .putPlayerData(oPlayerData)
                    .putCanFireAPlayer(bCanFireAPlayer)
                    .renewDisplay();
            }
        }
    }

    /**
     * 显示吃碰杠胡操作提示
     * 
     * @param oParam 吃碰杠胡操作提示参数
     */
    showChiPengGangHuOpHint(oParam: ChiPengGangHuOpHintParam): void {
        if (null == oParam) {
            return;
        }

        // 添加空值检查，防止场景节点不存在导致卡死
        const oRootNode = cc.find("Canvas/InteractionArea/ChiPengGangHuOpArea");
        if (null == oRootNode) {
            cc.error("InteractionArea/ChiPengGangHuOpArea 节点不存在，请检查场景文件！");
            return;
        }
        
        // 更新见字胡状态
        if (oParam.jianZiHuHint !== undefined && oParam.jianZiHuHint !== null) {
            this._bJianZiHuState = oParam.jianZiHuHint;
        }
        
        // 保存胡牌牌面列表（统一处理，不区分有赖子/无赖子）
        // 增强的空值检查：确保服务端下发的 huTileArray 是有效数组
        if (oParam.huTileArray !== undefined && 
            oParam.huTileArray !== null && 
            Array.isArray(oParam.huTileArray)) {
            this._oHuTileArray = oParam.huTileArray;
            cc.log(`[听牌提示] 保存huTileArray: ${JSON.stringify(this._oHuTileArray)}`);
        } else {
            // 服务端未返回或返回无效数据时，初始化为空数组
            this._oHuTileArray = [];
            cc.warn(`[听牌提示] 服务端未返回有效的huTileArray，初始化为空数组`);
        }
        
        // 显示吃按钮并设置吃牌模式
        let oButtonChi = cc.find("Button_Chi_", oRootNode);
        if (oButtonChi) {
            oButtonChi.active = oParam.opHintChi;
            oButtonChi.attr({ custom_chiChoiceQuestion: oParam.chiChoiceQuestion, });
        }
        
        // 显示碰杠按钮
        let oButtonPeng = cc.find("Button_Peng_", oRootNode);
        if (oButtonPeng) {
            oButtonPeng.active = oParam.opHintPeng;
        }
        
        let oButtonGang = cc.find("Button_Gang_", oRootNode);
        if (oButtonGang) {
            oButtonGang.active = oParam.opHintGang;
        }
        
        // 显示胡按钮 - 如果处于见字胡状态，禁用胡牌按钮
        let oButtonHu = cc.find("Button_Hu_", oRootNode);
        if (oButtonHu) {
            // 当处于见字胡状态时，即使服务端说可以胡，也不显示胡牌按钮
            const bCanShowHu = oParam.opHintHu && !this._bJianZiHuState;
            oButtonHu.active = bCanShowHu;
        }
        
        // 显示亮风和补风按钮
        let oButtonLiangFeng = cc.find("Button_LiangFeng_", oRootNode);
        if (oButtonLiangFeng) {
            oButtonLiangFeng.active = oParam.opHintLiangFeng;
            oButtonLiangFeng.attr({ 
                custom_chiPengGangHuOpHintParam: oParam,
                custom_liangFengChoiceQuestion: oParam.liangFengChoiceQuestion, 
            });
        }
        
        let oButtonBuFeng = cc.find("Button_BuFeng_", oRootNode);
        if (oButtonBuFeng) {
            oButtonBuFeng.active = oParam.opHintBuFeng;
        }
        
        // 显示或隐藏"不能见字胡"提示
        this.updateJianZiHuHint();
        
        // 检查是否有任何可用的操作（不包括见字胡提示）
        const bHasAnyOp = oParam.opHintChi || oParam.opHintPeng || oParam.opHintGang || 
                          oParam.opHintHu || oParam.opHintLiangFeng || oParam.opHintBuFeng;
        
        // 如果没有任何可用操作，但有见字胡提示，仍然显示操作区域
        const bShouldShowArea = bHasAnyOp || this._bJianZiHuState;
        oRootNode.active = bShouldShowArea;
    }

    /**
     * 隐藏吃碰杠胡操作提示
     */
    hideChiPengGangHuOpHint(): MJ_weihai_Scene {
        const oRootNode = cc.find("Canvas/InteractionArea/ChiPengGangHuOpArea");
        if (oRootNode) {
            oRootNode.active = false;
        }
        
        return this;
    }

    /**
     * 更新见字胡提示显示
     * 当处于见字胡状态时，使用Toast消息提示"不能见字胡"
     */
    updateJianZiHuHint(): void {
        if (this._bJianZiHuState) {
            // 显示Toast警告消息
            const oErrorHint = ErrorHintFactory.getCreatedHint();
            if (oErrorHint) {
                oErrorHint.putErrorCode(-1)
                    .putErrorMsg("不能见字胡")
                    .renewDisplay();
                
                // 播放警告音效（暂时使用按钮点击音效，后续可替换为专用警告音效）
                if (AppSetting.getInstance()._bEnableSound) {
                    AudioMajordomo.getInstance().playSound(
                        ModConfig.BUNDLE_NAME,
                        "res/1/audio/ButtonClicked_0_"
                    );
                }
            }
            
            cc.log("[见字胡] 显示警告：不能见字胡");
        } else {
            // 解除见字胡状态，不显示提示
            cc.log("[见字胡] 警告已解除");
        }
    }

    /**
     * 更新胡牌牌面显示（一赖到底玩法）
     * 显示可以胡的牌面列表
     * 
     * @deprecated 原版__hintMahjongCanHu已经直接操作Pattern节点，不再需要此方法
     * 保留此方法仅为兼容旧代码，实际已不再使用
     */
    updateHuTileDisplay(): void {
        // 原版逻辑已移至__createMahjongTable.ts的__hintMahjongCanHu函数
        // 此方法不再使用，保留仅为兼容性
        cc.warn("[胡牌提示] updateHuTileDisplay方法已废弃，请使用__hintMahjongCanHu");
    }

    /**
     * 显示选择飘提示
     */
    showSelectPiaoHint(): MJ_weihai_Scene {
        cc.find("Canvas/InteractionArea/SelectPiaoHintArea").active = true;
        return this;
    }

    /**
     * 隐藏邀请
     */
    hideInvite(): MJ_weihai_Scene {
        const oInviteNode = cc.find("Canvas/InteractionArea/Button_Invite_");
        if (oInviteNode) {
            oInviteNode.active = false;
        }
        return this;
    }

    /**
     * 本地计算并显示选牌预览结果（一赖到底玩法）
     * 
     * @param nTileValue 玩家想打出的牌
     */
    private _calcAndShowSelectTilePreview(nTileValue: number): void {
        // 1. 获取玩家数据
        const nMyUserId = UserData.getMyData().getUserId();
        const oTableComp = cc.find("Canvas/MahjongTableArea")?.getComponentInChildren(MahjongTableComp);
        if (!oTableComp) {
            cc.warn(`[选牌预览] 找不到牌桌组件`);
            return;
        }
        
        const oPlayer = oTableComp._oPlayerDataMap[nMyUserId];
        if (oPlayer === null || oPlayer === undefined) {
            cc.warn(`[选牌预览] 找不到玩家数据 userId=${nMyUserId}`);
            return;
        }
        
        // 获取手牌数据和赖子牌信息（完全依赖服务端下发）
        const oMahjongInHand = oPlayer.mahjongInHand || [];
        const nMoPai = oPlayer.mahjongMoPai || 0;
        const nLaiZiTile = oPlayer.laiZiTile || 0;
        
        // 验证赖子牌是否有效
        if (nLaiZiTile <= 0) {
            cc.warn(`[选牌预览] 赖子牌无效: ${nLaiZiTile}，请检查服务端是否正确下发 laiZiTile 字段`);
            return;
        }
        
        // 构建完整手牌
        const oFullHand = [...oMahjongInHand];
        if (nMoPai > 0) {
            oFullHand.push(nMoPai);
        }
        
        // 手牌数量验证
        const nHandLength = oFullHand.length;
        if (nHandLength < 1 || nHandLength > 14) {
            cc.warn(`[选牌预览] 手牌数量异常: ${nHandLength}张`);
            return;
        }
        
        if (nHandLength % 3 !== 2) {
            cc.warn(`[选牌预览] 手牌数量不符合麻将规则: ${nHandLength}张`);
            return;
        }
        
        // 模拟打出一张牌
        const nTileIndex = oFullHand.indexOf(nTileValue);
        if (nTileIndex === -1) {
            cc.warn(`[选牌预览] 手牌中找不到要打出的牌: ${nTileValue}`);
            return;
        }
        
        const oRemainingHand = [...oFullHand];
        oRemainingHand.splice(nTileIndex, 1);
        
        // 计算胡牌列表
        const oHuTiles = HuCalculator.calculateHuTiles(oRemainingHand, nLaiZiTile);
        
        // 显示结果
        this.showSelectTilePreview(nTileValue, oHuTiles);
    }

    /**
     * 显示选牌预览结果（一赖到底玩法）
     * 
     * @param nSelectTile 玩家选择的牌
     * @param oHuTileArray 如果打出这张牌后，可以胡的牌列表
     */
    showSelectTilePreview(nSelectTile: number, oHuTileArray: Array<number>): void {
        this._nSelectTilePreview = nSelectTile;
        this._oSelectTilePreviewHuArray = oHuTileArray || [];
        
        this.updateSelectTilePreviewUI();
    }

    /**
     * 隐藏选牌预览
     */
    hideSelectTilePreview(): void {
        this._nSelectTilePreview = -1;
        this._oSelectTilePreviewHuArray = [];
        
        const oPreviewArea = this._getSelectTilePreviewAreaNode(false);
        if (oPreviewArea) {
            oPreviewArea.active = false;
        }
    }

    /**
     * 获取手牌区域节点
     */
    _getMahjongInHandAreaNode(): cc.Node | null {
        if (this._oMahjongInHandAreaNode && cc.isValid(this._oMahjongInHandAreaNode)) {
            return this._oMahjongInHandAreaNode;
        }

        const oTableArea = cc.find("Canvas/MahjongTableArea");
        if (!oTableArea) {
            return null;
        }

        let oAreaNode = cc.find("Seat_0_/MahjongInHandArea", oTableArea);
        if (!oAreaNode) {
            const oInHandGroupComp = oTableArea.getComponentInChildren(MahjongInHandGroupComp);
            if (oInHandGroupComp && oInHandGroupComp.node && oInHandGroupComp.node.parent) {
                oAreaNode = oInHandGroupComp.node.parent;
            }
        }

        if (oAreaNode) {
            this._oMahjongInHandAreaNode = oAreaNode;
        }

        return oAreaNode;
    }

    /**
     * 获取选牌预览显示区域节点
     * 
     * @param bCreateIfMissing 如果不存在是否创建
     * @return 选牌预览显示区域节点
     */
    _getSelectTilePreviewAreaNode(bCreateIfMissing: boolean = true): cc.Node | null {
        // 优先返回缓存的节点
        if (this._oSelectTilePreviewAreaNode && cc.isValid(this._oSelectTilePreviewAreaNode)) {
            return this._oSelectTilePreviewAreaNode;
        }

        // 查找 InteractionArea（与胡牌提示保持一致）
        let oParentNode = cc.find("Canvas/InteractionArea");
        
        if (!oParentNode) {
            // 降级方案：使用 Canvas
            oParentNode = cc.find("Canvas");
        }
        
        if (!oParentNode) {
            return null;
        }

        // 在父节点下查找 SelectTilePreviewArea
        let oPreviewArea = cc.find("SelectTilePreviewArea", oParentNode);
        
        if (!oPreviewArea && bCreateIfMissing) {
            // 创建选牌预览显示区域
            oPreviewArea = new cc.Node("SelectTilePreviewArea");
            oPreviewArea.setParent(oParentNode);
            oPreviewArea.setPosition(0, -200);
            oPreviewArea.setSiblingIndex(999);
            
            // 添加布局组件
            const oLayout = oPreviewArea.addComponent(cc.Layout);
            oLayout.type = cc.Layout.Type.HORIZONTAL;
            oLayout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
            oLayout.spacingX = 15;
            oLayout.paddingLeft = 10;
            oLayout.paddingRight = 10;
        }

        if (oPreviewArea) {
            this._oSelectTilePreviewAreaNode = oPreviewArea;
        }

        return oPreviewArea;
    }

    /**
     * 获取麻将牌模板节点
     */
    _getMahjongTileOpTemplateNode(): cc.Node | null {
        const oPrefabTemplateNode = this._getMahjongTileOpTemplateNodeFromPrefab();
        if (oPrefabTemplateNode) {
            return oPrefabTemplateNode;
        }

        const oTableArea = cc.find("Canvas/MahjongTableArea");
        if (oTableArea) {
            const oInHandGroupComp = oTableArea.getComponentInChildren(MahjongInHandGroupComp);
            if (oInHandGroupComp) {
                const oTemplateNode = this._findMahjongTileOpTemplateRecursively(oInHandGroupComp.node);
                if (oTemplateNode) {
                    return oTemplateNode;
                }
            }

            for (let nSeatIndex = 0; nSeatIndex < 4; nSeatIndex++) {
                const oSeatNode = cc.find(`Seat_${nSeatIndex}_/MahjongInHandArea`, oTableArea);
                if (oSeatNode) {
                    const oTemplateNode = this._findMahjongTileOpTemplateRecursively(oSeatNode);
                    if (oTemplateNode) {
                        return oTemplateNode;
                    }
                }
            }

            const oTemplateNode = this._findMahjongTileOpTemplateRecursively(oTableArea);
            if (oTemplateNode) {
                return oTemplateNode;
            }
        }

        const oCanvas = cc.find("Canvas");
        if (oCanvas) {
            const oTemplateNode = this._findMahjongTileOpTemplateRecursively(oCanvas);
            if (oTemplateNode) {
                return oTemplateNode;
            }
        }

        const oScene = cc.director.getScene();
        if (oScene) {
            const oTemplateNode = this._findMahjongTileOpTemplateRecursively(oScene);
            if (oTemplateNode) {
                return oTemplateNode;
            }
        }

        cc.error("[选牌预览] 找不到 MahjongTileOpTemplate 模板节点，请检查场景结构");
        return null;
    }

    /**
     * 直接从手牌组预制体加载麻将牌模板节点
     */
    _getMahjongTileOpTemplateNodeFromPrefab(): cc.Node | null {
        if (this._oSelectTilePreviewTemplateNode && cc.isValid(this._oSelectTilePreviewTemplateNode)) {
            return this._oSelectTilePreviewTemplateNode;
        }

        if (!this._ensureSelectTilePreviewTemplateRoot()) {
            return null;
        }

        const oTemplateNode = this._findMahjongTileOpTemplateRecursively(this._oSelectTilePreviewTemplateRoot!);
        if (!oTemplateNode) {
            cc.error("[选牌预览] 预制体中找不到 MahjongTileOpTemplate");
            this._resetSelectTilePreviewTemplateCache();
            return null;
        }

        const oStateNode = cc.find("State_0_", oTemplateNode);
        const oValNode = cc.find("Val", oTemplateNode);
        if (!oStateNode || !oValNode) {
            cc.error("[选牌预览] MahjongTileOpTemplate 结构不完整: State_0_ 或 Val 缺失");
            this._resetSelectTilePreviewTemplateCache();
            return null;
        }

        oTemplateNode.active = false;
        this._oSelectTilePreviewTemplateNode = oTemplateNode;
        cc.log("[选牌预览] 从预制体根缓存加载 MahjongTileOpTemplate 模板");
        return oTemplateNode;
    }

    _ensureSelectTilePreviewTemplateRoot(): boolean {
        if (this._oSelectTilePreviewTemplateRoot && cc.isValid(this._oSelectTilePreviewTemplateRoot)) {
            return true;
        }

        if (this._nSelectTilePreviewTemplateLoadRetry >= 1) {
            cc.error("[选牌预览] 预制体模板加载重试失败，停止再次尝试");
            return false;
        }

        const oBundle = cc.assetManager.getBundle(ModConfig.BUNDLE_NAME);
        if (!oBundle) {
            cc.error("[选牌预览] 找不到 Bundle");
            this._nSelectTilePreviewTemplateLoadRetry += 1;
            return false;
        }

        const strPrefabPath = "res/0/prefab/MahjongInHandGroupAtSeat_0_";
        const oPrefab = oBundle.get(strPrefabPath) as cc.Prefab;
        if (!oPrefab) {
            cc.error(`[选牌预览] 预制体未加载: ${strPrefabPath}`);
            this._nSelectTilePreviewTemplateLoadRetry += 1;
            return false;
        }

        const oPrefabRoot = cc.instantiate(oPrefab);
        if (!oPrefabRoot) {
            cc.error("[选牌预览] 预制体实例化失败");
            this._nSelectTilePreviewTemplateLoadRetry += 1;
            return false;
        }

        oPrefabRoot.name = "SelectTilePreviewTemplateRoot";
        oPrefabRoot.active = false;
        oPrefabRoot.parent = null as any;
        this._oSelectTilePreviewTemplateRoot = oPrefabRoot;
        this._nSelectTilePreviewTemplateLoadRetry = 0;
        return true;
    }

    _resetSelectTilePreviewTemplateCache(): void {
        if (this._oSelectTilePreviewTemplateRoot && cc.isValid(this._oSelectTilePreviewTemplateRoot)) {
            this._oSelectTilePreviewTemplateRoot.destroy();
        }
        this._oSelectTilePreviewTemplateRoot = null;
        this._oSelectTilePreviewTemplateNode = null;
        this._nSelectTilePreviewTemplateLoadRetry = 0;
    }

    /**
     * 递归查找MahjongTileOpTemplate节点
     */
    _findMahjongTileOpTemplateRecursively(oParentNode: cc.Node): cc.Node | null {
        if (!oParentNode) {
            return null;
        }

        // 检查当前节点是否是模板
        if (oParentNode.name === "MahjongTileOpTemplate") {
            return oParentNode;
        }

        // 递归检查子节点
        for (let oChild of oParentNode.children) {
            const oFound = this._findMahjongTileOpTemplateRecursively(oChild);
            if (oFound) {
                return oFound;
            }
        }

        return null;
    }

    /**
     * 更新选牌预览显示区域
     */
    updateSelectTilePreviewUI(): void {
        // 使用统一的节点获取方法（与hideSelectTilePreview保持一致）
        let oPreviewArea = this._getSelectTilePreviewAreaNode(true);
        if (!oPreviewArea) {
            cc.error("[选牌预览UI] 无法获取或创建选牌预览区域节点");
            return;
        }

        // ★★★ 彻底清空旧的牌面显示（与胡牌提示相同的清理逻辑）★★★
        const nMaxPatterns = 10;
        const oPatternNodesToRemove = [];
        
        for (let i = 0; i < nMaxPatterns; i++) {
            const oPatternNode = oPreviewArea.getChildByName(`Pattern_${i}_`);
            if (oPatternNode) {
                oPatternNodesToRemove.push(oPatternNode);
            }
        }
        
        // 移除所有旧Pattern节点
        for (const oPatternNode of oPatternNodesToRemove) {
            oPatternNode.removeFromParent();
            oPatternNode.destroy();
        }

        // ★★★ 关键修复：无论是否有数据，都要确保区域可见 ★★★
        oPreviewArea.active = true;

        // 如果没有胡牌数据，只显示提示信息
        if (!this._oSelectTilePreviewHuArray || this._oSelectTilePreviewHuArray.length === 0) {
            // 查找或创建提示标签
            let oHintLabel = cc.find("NoHuHintLabel", oPreviewArea);
            if (!oHintLabel) {
                oHintLabel = new cc.Node("NoHuHintLabel");
                oPreviewArea.addChild(oHintLabel);
                
                const oLabel = oHintLabel.addComponent(cc.Label);
                oLabel.string = "打这张牌无法听牌";
                oLabel.fontSize = 20;
                oLabel.lineHeight = 24;
                oLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
                oLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
                oHintLabel.color = new cc.Color(255, 100, 100);
            }
            oHintLabel.active = true;
            
            // 设置预览区域层级
            oPreviewArea.zIndex = 1000;
            return;
        }

        // 获取麻将牌模板节点（与胡牌提示相同的获取方式）
        let oTemplateNode: cc.Node | undefined = undefined;
        
        // 方法1: 通过MahjongInHandGroupComp获取模板
        const oTableArea = cc.find("Canvas/MahjongTableArea");
        if (oTableArea) {
            const oInHandGroupComp = oTableArea.getComponentInChildren(MahjongInHandGroupComp);
            if (oInHandGroupComp) {
                oTemplateNode = cc.find("MahjongTileOpTemplate", oInHandGroupComp.node);
            }
        }
        
        // 方法2: 直接查找 MahjongInHandGroup
        if (!oTemplateNode) {
            const oInHandGroup = cc.find("Canvas/MahjongTableArea/Seat_0_/MahjongInHandArea/MahjongInHandGroup");
            if (oInHandGroup) {
                oTemplateNode = cc.find("MahjongTileOpTemplate", oInHandGroup);
            }
        }
        
        if (!oTemplateNode) {
            cc.error("[选牌预览UI] 找不到麻将牌模板节点，请检查场景结构");
            return;
        }

        // 显示每个可以胡的牌（与胡牌提示相同的Pattern节点风格）
        const SPACING = 10;

        for (let nIndex = 0; nIndex < this._oSelectTilePreviewHuArray.length; nIndex++) {
            const nTileValue = this._oSelectTilePreviewHuArray[nIndex];
            
            if (nTileValue <= 0) {
                continue;
            }

            try {
                // 查找是否已有Pattern节点
                let oTileNode = oPreviewArea.getChildByName(`Pattern_${nIndex}_`);
                
                // 如果不存在，创建新节点
                if (!oTileNode) {
                    oTileNode = new cc.Node(`Pattern_${nIndex}_`);
                    oPreviewArea.addChild(oTileNode);
                    
                    // 设置位置：水平排列
                    oTileNode.x = nIndex * (oTemplateNode.width + SPACING);
                    oTileNode.y = 0;
                }
                
                oTileNode.active = true;
                
                // 克隆麻将牌节点（如果还没有子节点）
                if (oTileNode.childrenCount === 0) {
                    let oClonedNode = cc.instantiate(oTemplateNode);
                    if (!oClonedNode) {
                        continue;
                    }
                    
                    // ★★★ 关键修复：先添加组件，设置状态，然后再addChild ★★★
                    // 1. 手动添加MahjongTileOpComp组件（如果模板没有）
                    let oTileComp = oClonedNode.getComponent(MahjongTileOpComp);
                    if (!oTileComp) {
                        oTileComp = oClonedNode.addComponent(MahjongTileOpComp);
                    }
                    
                    if (oTileComp) {
                        // 2. 先设置状态（朝上）- 激活State_0_节点
                        oTileComp.setState(0);
                        
                        // 3. 再设置牌值 - 更新牌面图片
                        oTileComp.putVal(nTileValue);
                        
                        // 4. 最后才addChild到Pattern节点
                        oTileNode.addChild(oClonedNode);
                        
                        // 5. 移除事件监听器（预览牌不可点击）
                        oTileComp.node.targetOff(oTileComp.node);
                        
                        // 6. 添加阻止输入事件的组件
                        if (!oClonedNode.getComponent(cc.BlockInputEvents)) {
                            oClonedNode.addComponent(cc.BlockInputEvents);
                        }
                    }
                } else {
                    // 更新已有节点的牌值
                    let oClonedNode = oTileNode.children[0];
                    let oTileComp = oClonedNode.getComponent(MahjongTileOpComp);
                    if (oTileComp) {
                        oTileComp.putVal(nTileValue);
                        
                        // 更新所有状态的牌面
                        const stateNames = ["State_0_", "State_1_", "State_2_", "State_3_"];
                        for (let stateName of stateNames) {
                            const oStateNode = cc.find(stateName, oClonedNode);
                            if (oStateNode) {
                                const oStateVal = cc.find("Val", oStateNode);
                                if (oStateVal) {
                                    const oSprite = oStateVal.getComponent(cc.Sprite);
                                    if (oSprite) {
                                        const oFrame = AllMahjongValImg.getSpriteFrame(nTileValue);
                                        if (oFrame) {
                                            oSprite.spriteFrame = oFrame;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (oError) {
                cc.error(`[选牌预览UI] 创建预览牌面时出错, index = ${nIndex}, tileValue = ${nTileValue}`, oError);
            }
        }
        
        // 确保预览区域层级足够高
        oPreviewArea.zIndex = 1000;
    }

}

///////////////////////////////////////////////////////////////////////

/**
 * 缓存数据
 * 
 * @param oRuleSetting 规则设置
 * @param oSyncRoomDataResult 同步房间数据结果
 */
function __doCaching(oRuleSetting: RuleSetting, oSyncRoomDataResult: ISyncRoomDataResult): void {
    if (null == oRuleSetting || 
        null == oSyncRoomDataResult) {
        return;
    }

    CachedData.getInstance().set(CachingKeyDef.CACHED_ROOM, {
        roomId: oSyncRoomDataResult.roomId,
        roomCreateTime: oSyncRoomDataResult.roomCreateTime,
        roomOwnerId: oSyncRoomDataResult.roomOwnerId,
        ruleSetting: oRuleSetting,
    });

    const oPlayerArray = oSyncRoomDataResult.player ?? [];

    for (let oCurrPlayer of oPlayerArray) {
        if (null == oCurrPlayer || null == oCurrPlayer.userId) {
            continue;
        }

        UserData.checkIn(
            oCurrPlayer.userId,
            oCurrPlayer.userName ?? "",
            oCurrPlayer.headImg ?? "",
            oCurrPlayer.sex ?? 0,
            oCurrPlayer.clientIpAddr ?? ""
        );
    }
}
