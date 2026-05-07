// @import
import ModConfig from "./ModConfig.ver_MJ_weihai_";
import MahjongTileDef from "./MahjongTileDef";

// @const
const PREFAB_NAME = "res/0/prefab/AllMahjongValImg";

/**
 * 所有麻将值,
 * 
 * 因为在发布正式版本的时候, 
 * 所有麻将牌值会被打入到一张图片合集中!
 * 这时候直接使用 Bundle 加载图片名称的方式会导致图片显示不出来...
 * 为了避免上述问题,
 * 建立了 AllMahjongVal 阈值体,
 * 在该预制体中设置了所有麻将牌花图片 ( 算是一种提前缓存 )!
 * 而当前类就是读取这个预制体中的图片...
 */
export default class AllMahjongValImg {
    /**
     * 缓存节点
     */
    private static _oCachedNode: cc.Node | null = null;

    /**
     * 类默认构造器
     */
    private constructor() {
    }

    /**
     * 获取麻将图片
     * 
     * @param nMahjongVal 麻将值
     */
    static getSpriteFrame(nMahjongVal: number): cc.SpriteFrame | null {
        if (-1 == MahjongTileDef.getValidVal(nMahjongVal)) {
            return null;
        }

        // 获取子节点
        const strChildName =`MahjongVal_${nMahjongVal}_`;
        const oCachedNode = AllMahjongValImg.getCachedNode();
        
        if (!oCachedNode) {
            cc.error(`[AllMahjongValImg] 缓存节点为空，无法获取牌值: ${nMahjongVal}`);
            return null;
        }
        
        const oChildNode = cc.find(strChildName, oCachedNode);
        
        if (null == oChildNode) {
            cc.error(`[AllMahjongValImg] 未找到子节点, childName = ${strChildName}, 牌值 = ${nMahjongVal}`);
            return null;
        }

        const oSprite = oChildNode.getComponent(cc.Sprite);
        if (!oSprite || !oSprite.spriteFrame) {
            cc.error(`[AllMahjongValImg] Sprite或SpriteFrame为空, childName = ${strChildName}`);
            return null;
        }

        return oSprite.spriteFrame;
    }

    /**
     * 获取缓存节点
     * 
     * @return Cocos 节点
     */
    private static getCachedNode(): cc.Node | null {
        if (null != AllMahjongValImg._oCachedNode) {
            // 如果已有缓存节点,
            // 直接返回...
            return AllMahjongValImg._oCachedNode;
        }

        // 获取 Bundle
        let oBundle = cc.assetManager.getBundle(ModConfig.BUNDLE_NAME);

        if (null == oBundle) {
            cc.error("oBundle is null");
            return null;
        }

        // 获取已经缓存的预制体
        const oCachedPrefab = oBundle.get(PREFAB_NAME) as cc.Prefab;

        if (null == oCachedPrefab) {
            cc.error("\"所有麻将牌值\" 预制体为空");
            return null;
        }

        const oNewNode = cc.instantiate(oCachedPrefab);

        if (null == oNewNode) {
            cc.error("\"创建新节点失败\" 预制体为空");
            return null;
        }

        AllMahjongValImg._oCachedNode = oNewNode;
        return AllMahjongValImg._oCachedNode;
    }
}
