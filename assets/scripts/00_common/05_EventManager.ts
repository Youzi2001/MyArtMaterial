import { EventTarget } from "cc";

// 定义事件名称常量，避免硬编码字符串出错
// 可以往里面添加更多事件
export enum EventName  {
    MATERIAL_DATA_CHANGED = 'MATERIAL_DATA_CHANGED', // 素材数据发生变更
}


class EventManager {
    private static _instance: EventManager;
    private _eventTarget: EventTarget;

    private constructor() {
        this._eventTarget = new EventTarget();
    }

    public static get instance(): EventManager {
        if (!this._instance) {
            this._instance = new EventManager();
        }
        return this._instance;
    }

    /**
     * 监听事件
     * @param eventType 事件类型
     * @param callback 回调函数
     * @param target 调用者上下文（用于正确绑定 this 和后续移除监听）
     */
    public on<T = any>(eventType: string, callback: (data: T) => void, target?: any) {
        this._eventTarget.on(eventType, callback, target);
    }

    /** 
     * 监听一次事件（触发后自动移除）
     */
    public once<T=any>(eventType: string, callback: (data:T) => void, target?: any) {
        this._eventTarget.once(eventType,callback,target);
    }

    /**
     * 移除特定事件的监听
     * 注意： 参数必须与 on 注册时完全一致
     */
    public off(eventType: string, callback: Function, target?: any) {
        this._eventTarget.off(eventType, callback, target);
    }

    /**
     * 发射（广播）事件
     * @param eventType 事件类型
     * @param data 携带的数据
     */
    public emit<T = any>(eventType: string, data?: T) {
        this._eventTarget.emit(eventType, data);
    }

    /**
     * 清理某个目标对象上的所有监听（通常在组件 onDestroy 时调用，作为双重保险）
     */
    public clearTarget(target: any) {
        // EventTarget 本身没有直接清除特定target所有事件的方法
        // 但通常我们依靠在组件onDestroy中手动off来管理
        // 这里可以扩展更复杂的逻辑，或者简单依赖手动管理
    }

}

const eventManagerInstance = new EventManager();
export default eventManagerInstance;