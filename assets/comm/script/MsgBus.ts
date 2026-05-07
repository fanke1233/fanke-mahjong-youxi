// @import
import DateTimeUtil from "./DateTimeUtil";
import MsgRecognizer from "./MsgRecognizer";
import OutParam from "./OutParam";

declare const require: any;
const mod_protobufjs: any = require("./protobufjs/minimal.js");

/**
 * 消息总线
 */
export default class MsgBus {
    /**
     * 单例对象
     */
    static readonly _oInstance: MsgBus = new MsgBus();

    /**
     * 服务器地址
     */
    _strServerAddr: string = "127.0.0.1:10240";

    /**
     * 使用加密方式
     */
    _bUseSSL: boolean = true;

    /**
     * WebSocket
     */
    _oWebSocket: WebSocket | null = null;

    /**
     * 连接尝试次数
     */
    _nConnTryCount: number = 0;
    
    /**
     * 消息队列
     */
    _oMsgQ: Array<{ msgClazzName: string, msgBody: any, }> = [];

    /**
     * 类默认构造器
     */
    private constructor() {
        if (null != MsgBus._oInstance) {
            throw new Error("该类为单例类");
        }
    }

    /**
     * 获取单例对象
     * 
     * @return 单例对象
     */
    static getInstance(): MsgBus {
        return this._oInstance;
    }

    /**
     * 设置服务器地址
     * 
     * @param strVal 字符串值
     */
    putServerAddr(strVal: string): MsgBus {
        this._strServerAddr = strVal;
        return this;
    }

    /**
     * 设置使用 SSL
     * 
     * @param bVal 布尔值
     */
    putUseSSL(bVal: boolean): MsgBus {
        this._bUseSSL = bVal;
        return this;
    }

    /**
     * 获取连接尝试次数
     */
    getConnTryCount(): number {
        return this._nConnTryCount;
    }

    /**
     * 是否已经准备好
     * 
     * @return true = 已经准备好, false = 未准备好
     */
    isReady(): boolean {
        return null != this._oWebSocket;
    }

    /**
     * 尝试初始化
     */
    tryInit(): { onOpen?: (() => void) | null, onError?: (() => void) | null, } | null {
        if (null != this._oWebSocket) {
            cc.warn(`WebSocket已经存在,跳过初始化`);
            return null;
        }

        let oFuture: { onOpen?: (() => void) | null, onError?: (() => void) | null, } = { 
            onOpen: null, onError: null, 
        };

        ++this._nConnTryCount;
        cc.log(`[MsgBus] 第 ${this._nConnTryCount} 次尝试连接服务器...`);

        // 服务器地址
        let strServerAddr: string;

        if (this._bUseSSL) {
            strServerAddr = `wss://${this._strServerAddr}/websocket`;
            cc.log(`[MsgBus] 使用SSL连接`);
        } else {
            strServerAddr = `ws://${this._strServerAddr}/websocket`;
            cc.log(`[MsgBus] 使用非SSL连接`);
        }

        cc.log(`[MsgBus] 完整WebSocket地址: ${strServerAddr}`);

        let oWS = new WebSocket(strServerAddr);
        oWS.binaryType = "arraybuffer";

        const SELF = this;

        cc.log(`[MsgBus] 准备连接服务器, serverAddr = ${strServerAddr}`);

        // open
        oWS.onopen = () => {
            let strCurrTime = DateTimeUtil.getYYYYMMddHHmmzzStr(Date.now());
            cc.log(`[MsgBus] ✅ 已经连接到服务器, currTime = ${strCurrTime}, serverAddr = ${strServerAddr}`);
            SELF._oWebSocket = oWS;
            SELF._nConnTryCount = 0;

            if (oFuture.onOpen) {
                oFuture.onOpen();
            }
        };

        // error
        oWS.onerror = (oError) => {
            cc.error(`[MsgBus]  连接服务器失败!`);
            cc.error(`[MsgBus] serverAddr = ${strServerAddr}`);
            cc.error(`[MsgBus] 错误详情:`, oError);
            cc.error(`[MsgBus] 请检查:`);
            cc.error(`[MsgBus] 1. natapp TCP隧道是否启动`);
            cc.error(`[MsgBus] 2. 游戏后端服务是否运行在20480端口`);
            cc.error(`[MsgBus] 3. 防火墙是否阻止连接`);
            SELF._oWebSocket = null;

            if (oFuture.onError) {
                oFuture.onError();
            }
        };

        // close
        oWS.onclose = (oEvent) => {
            let strCurrTime = DateTimeUtil.getYYYYMMddHHmmzzStr(Date.now());
            cc.warn(`[MsgBus] ⚠️ 服务器连接已关闭`);
            cc.warn(`[MsgBus] currTime = ${strCurrTime}`);
            cc.warn(`[MsgBus] 关闭代码: ${oEvent.code}, 原因: ${oEvent.reason}`);
            SELF._oWebSocket = null;
        }

        // message
        oWS.onmessage = (oEvent: MessageEvent) => {
            // 消息名称输出参数
            let out_oMsgClazzName = new OutParam<string>();

            let oEventData = oEvent.data;
            let oByteArray: Uint8Array;

            if (oEventData instanceof ArrayBuffer) {
                oByteArray = new Uint8Array(oEventData);
            } else if (ArrayBuffer.isView(oEventData)) {
                oByteArray = new Uint8Array(oEventData.buffer, oEventData.byteOffset, oEventData.byteLength);
            } else {
                cc.warn(`WebSocket 收到非法数据类型, type = ${typeof oEventData}`);
                return;
            }

            // 反序列化为消息体
            let oMsgBody = __makeMsgBody(oByteArray, out_oMsgClazzName);

            if ("object" != typeof(oMsgBody)) {
                return;
            }

        

            // 将消息加入队列
            SELF._oMsgQ.push({
                msgClazzName: out_oMsgClazzName.get(),
                msgBody: oMsgBody,
            });
        }

        return oFuture;
    }

    /**
     * 发送消息
     * 
     * @param nMsgCode 消息代号
     * @param oMsgBody 消息体
     */
    sendMsg(nMsgCode: number, oMsgBody: any): void {
        if ("object" != typeof(oMsgBody)) {
            cc.warn(`发送消息失败, oMsgBody 非法, msgCode=${nMsgCode}`);
            return;
        }

        if (null == this._oWebSocket) {
            cc.warn(`发送消息失败, WebSocket 未连接, msgCode=${nMsgCode}`);
            return;
        }

        // 序列化为字节数组
        let oUint8Array = __makeUint8Array(nMsgCode, oMsgBody);

        if (null == oUint8Array || 
            oUint8Array.byteLength <= 0) {
            cc.warn(`发送消息失败, 序列化后的字节数组无效, msgCode=${nMsgCode}`);
            return;
        }

        // 获取消息类名称
        let out_oMsgClazzName = new OutParam<string>();
        MsgRecognizer.getMsgClazzByMsgCode(nMsgCode, out_oMsgClazzName);

        // 发送字节数组
        this._oWebSocket.send(oUint8Array as any);
    }

    /**
     * 获取消息队列长度
     * 
     * @return 消息队列长度
     */
    getMsgQLen(): number {
        return this._oMsgQ.length;
    }

    /**
     * 取出一个消息
     * 
     * @return 消息包装对象
     */
    doMsgQShift(): { msgClazzName: string, msgBody: any, } | undefined {
        return this._oMsgQ.shift();
    }

    /**
     * 当收到消息, 需要被覆盖
     * 
     * @param strMsgClazzName 消息类名称
     * @param oMsgBody 消息体
     */
    onMsgHandler(strMsgClazzName: string, oMsgBody: any): void {
        if (null == strMsgClazzName || 
            null == oMsgBody) {
            return;
        }
    }
}

///////////////////////////////////////////////////////////////////////

/**
 * 将消息对象序列化为字节数组
 * 
 * @param nMsgCode 消息代号
 * @param oMsgBody 消息体
 * @return 字节数组
 */
function __toHexString(oByteArray: Uint8Array): string {
    if (!oByteArray || oByteArray.byteLength <= 0) {
        return "";
    }

    let a: string[] = [];
    for (let i = 0; i < oByteArray.byteLength; ++i) {
        let nVal = oByteArray[i] & 0xFF;
        a.push(nVal.toString(16).padStart(2, "0"));
    }
    return a.join(" ").toUpperCase();
}

function __makeUint8Array(nMsgCode: number, oMsgBody: any): Uint8Array | null {
    if (null == oMsgBody) {
        return null;
    }

    if (nMsgCode <= 0) {
        return null;
    }

    // 序列化消息体
    let oBodyBytes: Uint8Array;

    try {
        oBodyBytes = oMsgBody.constructor.encode(oMsgBody).finish();
    } catch (ex) {
        cc.error(`消息序列化失败, msgCode=${nMsgCode}, error=${ex}`);
        return null;
    }

    // 计算消息长度: msgCode(2 bytes) + body
    let nMsgLen = 2 + oBodyBytes.byteLength;
    let oByteArray = new Uint8Array(4 + oBodyBytes.byteLength);

    oByteArray[0] = (nMsgLen >> 8) & 0xff;
    oByteArray[1] = nMsgLen & 0xff;
    oByteArray[2] = (nMsgCode >> 8) & 0xff;
    oByteArray[3] = nMsgCode & 0xff;
    oByteArray.set(oBodyBytes, 4);

    return oByteArray;
}

/**
 * 将字节数组反序列化为消息对象
 * 
 * @param oByteArray 字节数组
 * @param out_oMsgClazzName 消息类名称
 */
function __makeMsgBody(oByteArray: Uint8Array, out_oMsgClazzName: OutParam<string>): any {
    if (!oByteArray || 
        !oByteArray.byteLength ||
        oByteArray.byteLength < 4) {
        cc.warn("收到的消息字节数组无效或太短");
        return null;
    }

    

    // 声明的消息长度
    let nMsgLen = (oByteArray[0] & 0xFF) << 8
        | (oByteArray[1] & 0xFF);
    let nActualLen = oByteArray.byteLength - 2;

    if (nMsgLen !== nActualLen) {
        cc.warn(`消息长度不匹配, headerLen=${nMsgLen}, actualLen=${nActualLen}`);
    }

    // 获取消息编码
    let nMsgCode = (oByteArray[2] & 0xFF) << 8
        | (oByteArray[3] & 0xFF);

    // 获取消息类
    let oMsgClazz = MsgRecognizer.getMsgClazzByMsgCode(
        nMsgCode, 
        out_oMsgClazzName
    );

    if (null == oMsgClazz) {
        cc.warn(`无法识别的消息编码, msgCode = ${nMsgCode}`);
        return null;
    }

    try {
        return oMsgClazz.decode(oByteArray.subarray(4));
    } catch (ex) {
        cc.error(`消息解码失败, msgCode=${nMsgCode}, error=${ex}`);
        return null;
    }
}
