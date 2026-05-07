//#region @import
import MahjongTileDef from "../MahjongTileDef";
import MahjongTileOpComp from "./MahjongTileOpComp";
//#endregion

// @const
const { ccclass } = cc._decorator;

/**
 * 麻将手牌分组组件
 */
@ccclass
export default class MahjongInHandGroupComp extends cc.Component {
    /**
     * 在手中的麻将牌数组
     */
    _oMahjongInHandArray: Array<number> = [];

    /**
     * 麻将摸牌
     */
    _nMahjongMoPai: number = -1;

    /**
     * 是否可以交互
     */
    _bCanInteractive: boolean = false;

    /**
     * 出牌动画已经完成
     */
    _bChuPaiAnimFinished: boolean = false;

    /**
     * 赖子生成牌 (一赖到底玩法)
     */
    _nLaiGenTile: number = -1;

    /**
     * 赖子牌 (一赖到底玩法)
     */
    _nLaiZiTile: number = -1;

    // /**
    //  * onLoad
    //  */
    // onLoad(): void {
    // }

    /**
     * start
     */
    start(): void {
        __regUIEvent(this);
    }

    // /**
    //  * update
    //  * 
    //  * @param nDeltaTime 变化时间
    //  */
    // update (nDeltaTime: number): void {
    // }

    /**
     * 更新麻将手牌
     * 
     * @param oMahjongValArray 麻将数值数值
     * @param nState 状态, 0 = 正常状态, 1 = 躺倒, 2 = 扣起来, 3 = 抬起
     * @param nLaiZiTile 赖子牌 (一赖到底玩法)
     */
    updateMahjongInHand(
        oMahjongValArray: Array<number>, 
        nState: number = 0,
        nLaiGenTile: number = -1,
        nLaiZiTile: number = -1): void {
        
        // 保存赖子牌信息
        if (nLaiGenTile > 0) {
            this._nLaiGenTile = nLaiGenTile;
        }
        if (nLaiZiTile > 0) {
            this._nLaiZiTile = nLaiZiTile;
        }
        
        // 一赖到底玩法：赖子牌不参与排序，始终保持在手牌最左边
        // 注意：麻将牌是从右到左渲染的（数组索引大的在左边）
        if (this._nLaiZiTile > 0) {
            // 分离赖子牌和普通牌
            let oLaiZiArray: Array<number> = [];
            let oNormalArray: Array<number> = [];
            
            for (let nTile of oMahjongValArray) {
                if (nTile === this._nLaiZiTile) {
                    oLaiZiArray.push(nTile);
                } else {
                    oNormalArray.push(nTile);
                }
            }
            
            // 只对普通牌进行排序
            oNormalArray = oNormalArray.sort((nX, nY) => nY - nX);
            
            // 合并：普通牌在前，赖子牌在后
            // 因为麻将是数组索引大的显示在左边，所以赖子牌放最后会显示在最左边
            oMahjongValArray = oNormalArray.concat(oLaiZiArray);
        } else {
            // 没有赖子牌，正常排序
            oMahjongValArray = oMahjongValArray.sort((nX, nY) => nY - nX);
        }
        
        this._oMahjongInHandArray = oMahjongValArray;

        // 安全获取Box_1_节点
        const oBox1Node = cc.find("Box_1_", this.node);
        if (!oBox1Node) {
            cc.error("找不到Box_1_节点");
            return;
        }

        // 实现移除所有的子节点
        oBox1Node.removeAllChildren(true);

        const oMahjongTileOpTemplate = cc.find("MahjongTileOpTemplate", this.node);
        if (!oMahjongTileOpTemplate) {
            cc.error("找不到MahjongTileOpTemplate模板节点");
            return;
        }

        const SELF = this;
        SELF._bChuPaiAnimFinished = false;

        let nPos = -1;

        for (let nMahjongVal of oMahjongValArray) {
            // 通过模板创建一个新节点实例
            const oNewNode = cc.instantiate(oMahjongTileOpTemplate);
            if (!oNewNode) {
                continue;
            }

            oNewNode.active = true;

            // 添加组件并设置属性
            const oNewComp = oNewNode.addComponent(MahjongTileOpComp);

            if (oNewComp && nMahjongVal > 0) {
                nPos++;
                oNewComp.putVal(nMahjongVal).putAtPos(nPos);
                
                // 标记赖子牌（一赖到底玩法）
                if (this._nLaiZiTile > 0 && nMahjongVal === this._nLaiZiTile) {
                    oNewComp.setIsLaiZi(true);
                } else {
                    // 确保非赖子牌不显示赖子标记
                    oNewComp.setIsLaiZi(false);
                }

                oNewComp.setState(nState);
                oBox1Node.addChild(oNewNode);
            }
        }
    }

    /**
     * 更新麻将摸牌
     * 
     * @param nMahjongVal 麻将面值
     * @param nState 状态
     * @param nLaiGenTile 赖子生成牌 (一赖到底玩法)
     * @param nLaiZiTile 赖子牌 (一赖到底玩法)
     */
    updateMahjongMoPai(nMahjongVal: number, nState = 0, nLaiGenTile: number = -1, nLaiZiTile: number = -1): void {
        // 保存赖子牌信息
        if (nLaiGenTile > 0) {
            this._nLaiGenTile = nLaiGenTile;
        }
        if (nLaiZiTile > 0) {
            this._nLaiZiTile = nLaiZiTile;
        }
        
        // 设置麻将摸牌
        this._nMahjongMoPai = nMahjongVal;
        this._bChuPaiAnimFinished = false;

        // 安全获取Box_0_节点
        const oBox0Node = cc.find("Box_0_", this.node);
        if (!oBox0Node) {
            cc.error("找不到Box_0_节点");
            return;
        }

        if (oBox0Node.childrenCount <= 0) {
            // 获取麻将牌模板
            const oMahjongTileOpTemplate = cc.find("MahjongTileOpTemplate", this.node);
            if (oMahjongTileOpTemplate) {
                // 通过模板创建一个新节点
                const oNewNode = cc.instantiate(oMahjongTileOpTemplate);
                if (oNewNode) {
                    oNewNode.addComponent(MahjongTileOpComp);

                    // 将新节点添加到 Box_0_
                    oBox0Node.addChild(oNewNode);
                }
            }
        }

        // 获取麻将牌操作组件
        const oThatComp = oBox0Node.getComponentInChildren(MahjongTileOpComp);
        const SELF = this;

        if (oThatComp && nMahjongVal > 0) {
            oThatComp.putVal(nMahjongVal);
            
            // 标记摸到的赖子牌（一赖到底玩法）
            if (this._nLaiZiTile > 0 && nMahjongVal === this._nLaiZiTile) {
                oThatComp.setIsLaiZi(true);
            } else {
                // 确保非赖子牌不显示赖子标记
                oThatComp.setIsLaiZi(false);
            }

            oThatComp.setState(nState);
            oThatComp.node.active = nMahjongVal > 0;
        }

        oBox0Node.active = true;
    }

    /**
     * 清空摸牌区
     * 当没有摸牌或摸牌已融入到手牌中时调用
     */
    clearMahjongMoPai(): void {
        const oBox0Node = cc.find("Box_0_", this.node);
        if (oBox0Node) {
            oBox0Node.active = false;
        }
        this._nMahjongMoPai = -1;
    }

    /**
     * 设置是否可以交互
     * 
     * @param bVal 布尔值
     */
    putCanInteractive(bVal: boolean): MahjongInHandGroupComp {
        this._bCanInteractive = bVal;
        return this;
    }

    /**
     * 执行麻将出牌
     * 
     * @param nMahjongVal 麻将出牌
     */
    doMahjongChuPai(nMahjongVal: number): void {
        if (nMahjongVal <= 0) {
            return;
        }

        if (this._nMahjongMoPai == nMahjongVal || 
            MahjongTileDef.MASK_VAL == this._nMahjongMoPai) {
            // 如果打出的是刚摸到的牌,
            const oBox0Node = cc.find("Box_0_", this.node);
            if (oBox0Node) {
                oBox0Node.active = false;
            }
            this._nMahjongMoPai = -1;
            return;
        }

        if (null == this._oMahjongInHandArray ||
            this._oMahjongInHandArray.length <= 0) {
            // 如果麻将手牌为空
            return;
        }

        // 查找要移除的麻将牌索引
        let nFoundIndex = this._oMahjongInHandArray.indexOf(nMahjongVal);

        if (nFoundIndex < 0) {
            cc.error("未找到要打出的麻将牌");
            return;
        }

        // 删除相关牌, 并更新手牌（使用splice而不是delete，避免数组出现undefined）
        this._oMahjongInHandArray.splice(nFoundIndex, 1);
        // 出牌后更新手牌时，传递保存的赖子牌信息
        this.updateMahjongInHand(
            this._oMahjongInHandArray,
            0,  // nState
            this._nLaiGenTile,  // 赖子生成牌
            this._nLaiZiTile    // 赖子牌
        );
    }

    /**
     * 检查是否可以出牌, 并播放动画
     * 
     * @param nChuPai 要打出的牌
     * @param nAtPos 出牌所在位置
     * @param funCb 回调函数
     */
    checkChuPaiAndPlayAnim(nChuPai: number, nAtPos: number, funCb: (bSuccezz: boolean) => void): void {
        // 确保回调函数不为空
        const finalCall = funCb || function() {
        }

        if (nChuPai <= MahjongTileDef.MASK_VAL || 
            !this._bCanInteractive ||
            this._bChuPaiAnimFinished ||
            this._nMahjongMoPai <= -1) { // 没有摸牌则不能出牌...
            finalCall(false);
            return;
        }

        if (nChuPai == this._nMahjongMoPai) {
            // 如果要出的牌正好和摸到的牌一致,
            finalCall(true);
            return;
        }

        if (this._oMahjongInHandArray.length <= nAtPos || 
            this._oMahjongInHandArray[nAtPos] != nChuPai) {
            cc.error(`所在位置的牌与要打出的牌不一致, chuPai = ${nChuPai}, atPost = ${nAtPos}`);
            finalCall(false);
            return;
        }

        let nInsPos = -1;

        for (let nTempIndex = 0; nTempIndex < this._oMahjongInHandArray.length; nTempIndex++) {
            if (this._oMahjongInHandArray[nTempIndex] < this._nMahjongMoPai) {
                // XXX 注意: 这个数组是倒序的
                // 所以要找到第一个小于 "摸牌" 的麻将牌所在位置...
                nInsPos = nTempIndex;
                break;
            }
        }

        const oBox1Node = cc.find("Box_1_", this.node);
        if (!oBox1Node) {
            cc.error("找不到Box_1_节点");
            finalCall(false);
            return;
        }

        let oChildNodeArray = oBox1Node.children;

        if (null == oChildNodeArray || 
            oChildNodeArray.length <= nAtPos) {
            cc.error(`Box_1_ 子节点数组数量不正确`);
            finalCall(false);
            return;
        }

        this._bChuPaiAnimFinished = true;

        let oMJNode_chu = oChildNodeArray[nAtPos];
        let oMJNode_x = oChildNodeArray[nInsPos];
        
        const oBox0Node = cc.find("Box_0_", this.node);
        if (!oBox0Node || !oBox0Node.children || oBox0Node.children.length === 0) {
            cc.error("Box_0_节点或其子节点不存在");
            finalCall(false);
            return;
        }
        
        let oMJNode_jin = oBox0Node.children[0];
        let oToPos = oMJNode_x.convertToWorldSpaceAR(cc.v3());
        let oFromPos = oMJNode_jin.convertToWorldSpaceAR(cc.v3());

        let oTempNode = new cc.Node();
        oBox1Node.insertChild(oTempNode, nInsPos);

        cc.tween(oMJNode_chu)
            .by(0.1, { y: 128, opacity: -255, })
            .delay(0.2)
            .to(0.1, { scale: 0, })
            .start();

        cc.tween(oTempNode)
            .delay(0.3)
            .to(0.1, { width: 130, })
            .start();

        cc.tween(oMJNode_jin)
            .by(0.1, { y: +128, angle: -32, })
            .by(0.2, { x: oToPos.x - oFromPos.x, })
            .by(0.1, { y: -128, angle: +32, })
            .call(() => { finalCall(true); })
            .start();
    }
}

///////////////////////////////////////////////////////////////////////

/**
 * 注册 UI 事件
 * 
 * @param SELF this 指针
 */
function __regUIEvent(SELF: MahjongInHandGroupComp): void {
    if (null == SELF) {
        return;
    }

    SELF.node.on(
        MahjongTileOpComp.EVENT_TOUCH_END, (oEvent: cc.Event.EventCustom) => {
            if (!SELF._bCanInteractive) {
                // 如果是不可交互的,
                // 则停止冒泡...
                oEvent.stopPropagation();
            }
        }
    );
}
