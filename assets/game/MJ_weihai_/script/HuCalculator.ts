/**
 * 本地胡牌计算工具（带赖子牌支持）
 * 用于"一赖到底"玩法的选牌预览功能
 */

import MahjongTileDef from "./MahjongTileDef";

/**
 * 胡牌计算工具类
 */
export default class HuCalculator {
    /**
     * 私有化类默认构造器
     */
    private constructor() {
    }

    /**
     * 计算可胡牌列表（带赖子）
     */
    public static calcCanHuTilesWithLaiZi(oHand: Array<number>, nLaiZiTile: number): Array<number> {
        const oHuTiles: Array<number> = [];
        
        // 收集所有可能的候选牌
        const oCandidateTiles = HuCalculator._collectCandidateTiles(oHand, nLaiZiTile);
        
        // 测试每张候选牌
        for (const nCandidate of oCandidateTiles) {
            // 构建测试手牌：当前手牌 + 候选牌
            const oTestHand = [...oHand, nCandidate];
            
            // 测试是否胡牌
            const bHu = HuCalculator._testHuWithLaiZi(oTestHand, nLaiZiTile);
            
            if (bHu) {
                oHuTiles.push(nCandidate);
            }
        }
        
        return oHuTiles;
    }

    /**
     * 收集候选牌
     * 候选牌包括：手牌中的牌 + 能组成顺子的牌 + 赖子牌（如果手牌中没有赖子牌）
     */
    private static _collectCandidateTiles(oHand: Array<number>, nLaiZiTile: number): Array<number> {
        const oCandidateSet = new Set<number>();
        
        // 检查手牌中是否已有赖子牌
        let bHandHasLaiZi = false;
        if (nLaiZiTile > 0) {
            for (const nTile of oHand) {
                if (nTile === nLaiZiTile) {
                    bHandHasLaiZi = true;
                    break;
                }
            }
        }
        
        // 1. 添加手牌中的所有牌（用于组成对子）
        for (const nTile of oHand) {
            if (nTile > 0) {
                oCandidateSet.add(nTile);
            }
        }
        
        // 2. 添加所有可能的顺子搭子缺张
        // 关键修复：遍历所有可能的万/条/饼牌值（21-29, 41-49, 81-89），而不仅限于VALUE_ARRAY
        // VALUE_ARRAY可能不包含所有牌（如风牌、箭牌），但我们需要检查所有万、条、饼
        for (let nSuitBase = 20; nSuitBase <= 80; nSuitBase *= 2) {
            if (nSuitBase === 60) continue; // 跳过60（不存在的花色）
            
            for (let nVal = 1; nVal <= 9; nVal++) {
                const nTile = nSuitBase + nVal;
                
                // 检查这张牌是否能与手牌组成顺子
                if (HuCalculator._canFormShunZiWithHand(nTile, oHand)) {
                    oCandidateSet.add(nTile);
                }
            }
        }
        
        // 3. 添加赖子牌（仅当手牌中没有赖子牌时）
        // 规则：两个以上赖子不能胡牌
        if (nLaiZiTile > 0 && !bHandHasLaiZi) {
            oCandidateSet.add(nLaiZiTile);
        }
        
        return Array.from(oCandidateSet);
    }
    
    /**
     * 检查某张牌是否能与手牌组成顺子
     * @param nTile 待检查的牌
     * @param oHand 手牌
     * @return true = 可以组成顺子
     */
    private static _canFormShunZiWithHand(nTile: number, oHand: Array<number>): boolean {
        // 只检查万、条、饼
        if (!MahjongTileDef.isWanTiaoBing(nTile)) {
            return false;
        }
        
        // 获取该牌的花色和数值（1-9）
        const nSuit = MahjongTileDef.getSuit(nTile);
        const nVal = nTile - nSuit; // 例如：45 - 40 = 5（5条）
        
        // 生成所有包含nTile的顺子（最多3种可能）
        // 例如：nTile=45（5条），可能的顺子：[43,44,45], [44,45,46], [45,46,47]
        for (let i = -2; i <= 0; i++) {
            const nStartVal = nVal + i;
            if (nStartVal < 1 || nStartVal > 7) continue; // 顺子起始值必须在1-7之间
            
            const nTile1 = nSuit + nStartVal;
            const nTile2 = nSuit + nStartVal + 1;
            const nTile3 = nSuit + nStartVal + 2;
            
            // 检查顺子中是否有牌在手牌中
            const bHasTile1 = oHand.includes(nTile1);
            const bHasTile2 = oHand.includes(nTile2);
            const bHasTile3 = oHand.includes(nTile3);
            
            // 如果顺子中有1-2张牌在手牌中（不是3张，因为3张已经是刻子了），则这张牌是候选牌
            const nCountInHand = (bHasTile1 ? 1 : 0) + (bHasTile2 ? 1 : 0) + (bHasTile3 ? 1 : 0);
            if (nCountInHand >= 1 && nCountInHand <= 2) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * 计算可胡牌列表
     */
    public static calculateHuTiles(oHand: Array<number>, nLaiZiTile: number): Array<number> {
        // 收集所有候选牌
        const oCandidateTiles = HuCalculator._collectCandidateTiles(oHand, nLaiZiTile);
        
        // 测试每张候选牌是否可以胡牌
        const oHuTiles: Array<number> = [];
        
        for (const nCandidate of oCandidateTiles) {
            const oTestHand = [...oHand, nCandidate];
            if (HuCalculator._testHuWithLaiZi(oTestHand, nLaiZiTile)) {
                oHuTiles.push(nCandidate);
            }
        }
        
        return oHuTiles;
    }

    /**
     * 测试手牌是否可以胡牌（带赖子）
     * 
     * @param oHand 手牌（13张）
     * @param nLaiZiTile 赖子牌
     * @return true = 可以胡牌
     */
    private static _testHuWithLaiZi(oHand: Array<number>, nLaiZiTile: number): boolean {
        // 统计赖子牌数量
        let nLaiZiCount = 0;
        const oNormalTiles: Array<number> = [];
        
        for (const nTile of oHand) {
            if (nTile === nLaiZiTile) {
                nLaiZiCount++;
            } else {
                oNormalTiles.push(nTile);
            }
        }
        
        // 规则：手牌中有一个赖子，或者无赖子，能够胡牌；两个以上赖子不能胡牌
        if (nLaiZiCount > 1) {
            return false;
        }
        
        // 测试所有可能的对子
        const oTestedDuiZi = new Set<number>();
        
        // 先对普通牌排序
        oNormalTiles.sort((a, b) => a - b);
        
        // 情况1：手牌中有普通对子
        for (let i = 0; i < oNormalTiles.length - 1; i++) {
            // 找到对子
            if (oNormalTiles[i] !== oNormalTiles[i + 1]) {
                continue;
            }
            
            const nDuiZi = oNormalTiles[i];
            
            if (oTestedDuiZi.has(nDuiZi)) {
                continue;
            }
            
            oTestedDuiZi.add(nDuiZi);
            
            // 子情况1.1：直接将对子作为将牌，测试剩余的牌
            {
                const oRemaining = [...oNormalTiles];
                oRemaining.splice(i, 2); // 移除对子
                
                if (HuCalculator._testRemainingTiles(oRemaining, nLaiZiCount)) {
                    return true;
                }
            }
        }
        
        // 情况1.5：手牌中有多个对子，用赖子将其中一个对子补充为刻子，另一个对子作为将牌
        // 场景：手牌有[42,42,45,45]，赖子=47
        // 策略：45+赖子形成[45,45,45]刻子，42作为将牌
        if (nLaiZiCount === 1) {
            // 找出所有对子
            const oAllDuiZi = new Set<number>();
            for (let i = 0; i < oNormalTiles.length - 1; i++) {
                if (oNormalTiles[i] === oNormalTiles[i + 1]) {
                    oAllDuiZi.add(oNormalTiles[i]);
                }
            }
            
            // 尝试将每个对子用赖子补充为刻子
            for (const nKeZiDuiZi of oAllDuiZi) {
                // 移除这个对子（用于形成刻子）
                const oTempRemaining = [...oNormalTiles];
                let bRemoved = false;
                for (let i = 0; i < oTempRemaining.length - 1; i++) {
                    if (oTempRemaining[i] === nKeZiDuiZi && oTempRemaining[i + 1] === nKeZiDuiZi) {
                        oTempRemaining.splice(i, 2);
                        bRemoved = true;
                        break;
                    }
                }
                
                if (!bRemoved) {
                    continue;
                }
                
                // 在剩余牌中寻找其他对子作为将牌
                for (let i = 0; i < oTempRemaining.length - 1; i++) {
                    if (oTempRemaining[i] === oTempRemaining[i + 1]) {
                        // 移除将牌对子
                        const oFinalRemaining = [...oTempRemaining];
                        oFinalRemaining.splice(i, 2);
                        
                        // 测试剩余牌（赖子已用于形成刻子，剩余赖子数=0）
                        if (HuCalculator._testRemainingTiles(oFinalRemaining, 0)) {
                            return true;
                        }
                    }
                }
            }
        }
        
        // 情况2：没有普通对子作为将牌能胡，尝试"赖子补位对子"（软胡）
        // 场景：手牌有[23, 24, 25, 26, 27, 28, 42, 45, 83, 84, 85]，赖子=47
        // 策略：赖子+42组成对子[42,42]作为将牌，测试剩余牌[23,24,25,26,27,28,45,83,84,85]
        if (nLaiZiCount === 1 && oNormalTiles.length > 0) {
            // 找出所有单张牌（不是对子的牌）
            const oSingleTiles = new Set<number>();
            const oCounted = new Set<number>();
            
            for (const nTile of oNormalTiles) {
                if (oCounted.has(nTile)) {
                    continue;
                }
                
                // 统计该牌的数量
                let nCount = 0;
                for (const t of oNormalTiles) {
                    if (t === nTile) {
                        nCount++;
                    }
                }
                
                // 如果只有1张，加入单张牌集合
                if (nCount === 1) {
                    oSingleTiles.add(nTile);
                }
                
                oCounted.add(nTile);
            }
            
            // 尝试将每个单张牌与赖子组成对子作为将牌
            for (const nSingleTile of oSingleTiles) {
                // 移除该单张牌（与赖子组成对子）
                const oRemaining = [...oNormalTiles];
                const idx = oRemaining.indexOf(nSingleTile);
                if (idx !== -1) {
                    oRemaining.splice(idx, 1);
                    
                    // 测试剩余牌（赖子已用于组成对子，剩余赖子数=0）
                    // 剩余牌数量应该是3的倍数
                    if (oRemaining.length % 3 === 0 && HuCalculator._testRemainingTiles(oRemaining, 0)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * 测试剩余牌是否可以全部组成刻子或顺子（带赖子）
     * 
     * @param oTiles 待测试的牌
     * @param nLaiZiCount 赖子牌数量
     * @return true = 可以组成
     */
    private static _testRemainingTiles(oTiles: Array<number>, nLaiZiCount: number): boolean {
        if (oTiles.length === 0) {
            return true;
        }
        
        // 排序
        oTiles.sort((a, b) => a - b);
        
        // 尝试移除刻子
        const oAfterKeZi = HuCalculator._removeAllKeZi([...oTiles], nLaiZiCount);
        if (oAfterKeZi === null) {
            return false;
        }
        
        const [oRemaining1, nLaiZiAfterKeZi] = oAfterKeZi;
        
        // 尝试移除顺子
        const oAfterShunZi = HuCalculator._removeAllShunZi(oRemaining1, nLaiZiAfterKeZi);
        if (oAfterShunZi === null) {
            return false;
        }
        
        const [oRemaining2, nLaiZiAfterShunZi] = oAfterShunZi;
        
        // 如果还有剩余牌，说明无法全部组成刻子或顺子
        // 注意：根据规则，两个以上赖子不能胡牌，所以不能用赖子补充剩余牌
        if (oRemaining2.length > 0) {
            return false;
        }
        
        return true;
    }

    /**
     * 移除所有刻子
     * @return [剩余牌, 剩余赖子数] 或 null（无法移除）
     */
    private static _removeAllKeZi(oTiles: Array<number>, nLaiZiCount: number): [Array<number>, number] | null {
        const oCount = new Map<number, number>();
        
        for (const nTile of oTiles) {
            oCount.set(nTile, (oCount.get(nTile) || 0) + 1);
        }
        
        const oRemaining = [...oTiles];
        let nLaiZiUsed = 0;
        
        // 获取所有不同的牌
        const oUniqueTiles = Array.from(oCount.keys()).sort((a, b) => a - b);
        
        for (const nTile of oUniqueTiles) {
            const nCount = oCount.get(nTile)!;
            
            if (nCount >= 3) {
                // 移除刻子
                for (let i = 0; i < 3; i++) {
                    const idx = oRemaining.indexOf(nTile);
                    if (idx !== -1) {
                        oRemaining.splice(idx, 1);
                    }
                }
            }
            // 注意：不再处理 nCount < 3 的情况，让顺子处理逻辑去处理
        }
        
        return [oRemaining, nLaiZiCount - nLaiZiUsed];
    }

    /**
     * 移除所有顺子
     * @return [剩余牌, 剩余赖子数] 或 null（无法移除）
     */
    private static _removeAllShunZi(oTiles: Array<number>, nLaiZiCount: number): [Array<number>, number] | null {
        if (oTiles.length === 0) {
            return [oTiles, nLaiZiCount];
        }
        
        oTiles.sort((a, b) => a - b);
        
        const oRemaining = [...oTiles];
        let nLaiZiUsed = 0;
        
        let i = 0;
        while (i < oRemaining.length) {
            const nTile1 = oRemaining[i];
            
            // 检查是否是万、条、饼
            if (!MahjongTileDef.isWanTiaoBing(nTile1)) {
                i++;
                continue;
            }
            
            // 查找 nTile1+1 和 nTile1+2
            const nTile2 = MahjongTileDef.getValidVal(nTile1 + 1);
            const nTile3 = MahjongTileDef.getValidVal(nTile1 + 2);
            
            const idx2 = oRemaining.indexOf(nTile2, i + 1);
            const idx3 = oRemaining.indexOf(nTile3, i + 1);
            
            if (idx2 !== -1 && idx3 !== -1) {
                // 找到顺子，移除
                oRemaining.splice(idx3, 1);
                oRemaining.splice(idx2, 1);
                oRemaining.splice(i, 1);
                // 不增加i，因为数组已经前移
            } else {
                // 尝试用赖子牌补充
                let nMissing = 0;
                if (idx2 === -1) nMissing++;
                if (idx3 === -1) nMissing++;
                
                if (nLaiZiCount - nLaiZiUsed >= nMissing) {
                    nLaiZiUsed += nMissing;
                    // 移除已有的牌
                    if (idx2 !== -1) oRemaining.splice(idx2, 1);
                    if (idx3 !== -1) {
                        const newIdx3 = oRemaining.indexOf(nTile3, i + 1);
                        if (newIdx3 !== -1) oRemaining.splice(newIdx3, 1);
                    }
                    oRemaining.splice(i, 1);
                } else {
                    i++;
                }
            }
        }
        
        return [oRemaining, nLaiZiCount - nLaiZiUsed];
    }

}
