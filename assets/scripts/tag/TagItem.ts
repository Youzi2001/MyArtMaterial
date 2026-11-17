/**
 * TagItem: 标签项
 * 职责：
 * 1、显示标签文本
 * 2、长按后通知外部（TagPanel）
 */

import { _decorator, Component, Node, Label, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TagItem')
export class TagItem extends Component {

    // ================编辑器绑定====================
    @property(Label)    
    lblTag: Label = null; 


    // ==================常量====================
    private readonly LONG_PRESS_TIME = 0.8;


    // =================内部数据==================
    private onLongPressCallback: (index: number) => void = null;
    private currentIndex: number = -1;
    private currentLabel: string = '';  
    private LongPressTimer: number = 0;
    private isLongPress: boolean = false;


    // =======================生命周期===========================
     onEnable() {
        this.node.on(Node.EventType.TOUCH_START,this.onTouchStart,this);
        this.node.on(Node.EventType.TOUCH_END,this.onTouchEnd,this);
        this.node.on(Node.EventType.TOUCH_CANCEL,this.onTouchCancel,this);
     }

     onDisable() {
        this.node.off(Node.EventType.TOUCH_START,this.onTouchStart,this);
        this.node.off(Node.EventType.TOUCH_END,this.onTouchEnd,this);
        this.node.off(Node.EventType.TOUCH_CANCEL,this.onTouchCancel,this);
        this.clearTime();
     }


    // ===========================公开接口（外部调用）===========================
    /** 设置标签文本 */
    public setTag(label: string) {
        this.currentLabel = label;
        this.lblTag.string = label;
        console.log('【Item】设置文本', label);  
    }


    /** 设置数据索引（长按回调时回传） */
    public setIndex(index: number) {
        this.currentIndex = index;
    }

    /** 设置长按回调 */
    public setLongPressCallback(cb: (index: number) => void) {
        this.onLongPressCallback = cb;
    }



    // =========================触摸事件（内部实现）==============================
    private onTouchStart(event: EventTouch) {
        event.propagationStopped = true;    // 阻止事件冒泡，避免父节点误响应
        this.isLongPress = false;
        this.clearTime();

        // 启动计时器
        this.LongPressTimer = setTimeout( () => {
            this.isLongPress = true;
            console.log('【长按触发】index=', this.currentIndex);
            if (this.onLongPressCallback) {
                this.onLongPressCallback(this.currentIndex);
            }
        },this.LONG_PRESS_TIME * 1000);
    }

    private onTouchEnd(event: EventTouch) {
        this.clearTime();
        if (this.isLongPress) {
            this.isLongPress = false;
            console.log('【长按结束，不触发点击】');
            return;
        } 
    }

    private onTouchCancel(event: EventTouch) {
        this.clearTime();
        this.isLongPress = false
    }


    // ========================工具方法===========================
    /** 清除长按计时器 */
    private clearTime() {
        if (this.LongPressTimer) {
            clearTimeout(this.LongPressTimer);
            this.LongPressTimer = 0;
        }
    }
}


