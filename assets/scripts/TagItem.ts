/**
 * 1、显示文本
 * 2、被长按时，通知外面
 */

import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TagItem')
export class TagItem extends Component {
    @property(Label)    
    lblTag: Label = null;   // 需要先绑定目标组件，需要再import中导入组件

    /**
     * 长按回调的配置逻辑
     * 1、首先需要定义一个长按函数，一个存放长按回调的方法
     * private onLongPressCallback: (index:number);
     * public setLongPressCallback(cb: (index:number) => void) {this.onLongPressCallback = cb};
     * 2、通过index确定长按的位置，所以还需要定义位置属性，以及接收位置的方法
     * private currentIndex: number = -1;
     * public setIndex(index: number)   // private 和 public 方法的区别，分别应该在什么时候用
     * 
     * 3、计算长按时间，需要引用 计时器句柄、设置标记记录是否已触发长按、设置长按阈值
     * private LongPressTimer: number = 0;  // 句柄是什么意思，这个不就是定义了一个整数属性吗
     * private isLongPress: boolean = false;
     * private readonly LONG_PRESS_TIME = 0.8;  //常量用全大写
     */

    private onLongPressCallback: (index: number) => void = null;
    private currentIndex: number = -1;
    private currentLabel: string = "";
     
    private LongPressTimer: number = 0;
    private isLongPress: boolean = false;
    private readonly LONG_PRESS_TIME = 0.8;

    public setIndex(index: number) {
        this.currentIndex = index;
    }

    public setLongPressCallback(cb: (index: number) => void) {
        this.onLongPressCallback = cb;
    }

    // =======================生命周期===========================
    // 不太明白这段代码的作用
     onEnable() {
        this.node.on(Node.EventType.TOUCH_START,this.onTouchStart,this);
        this.node.on(Node.EventType.TOUCH_END,this.onTouchEnd,this);
        this.node.on(Node.EventType.TOUCH_CANCEL,this.onTouchCancel,this);
     }

     onDisable() {
        this.node.off(Node.EventType.TOUCH_START,this.onTouchStart,this);
        this.node.off(Node.EventType.TOUCH_END,this.onTouchStart,this);
        this.node.off(Node.EventType.TOUCH_CANCEL,this.onTouchCancel,this);
     }

    // =========================触摸事件================================
    // 为什么在其他脚本中用private定义的事件，在这个脚本写的时候，未创建前，感觉就已经被记忆了，快捷输入的时候可以看到
    // 在另一个脚本中第一次定义的时候，就没有记忆的情况，是因为相同名字的函数，在不同脚本通用吗？
    // 那相同的长按事件，是不是只要在一个脚本中定义一个就行
    // 这几个函数互相之间的关联也没太明白
    
    private onTouchStart(event: EventTouch) {
        this.isLongPress = false;
        this.clearTime();

        // 启动计时器
        this.LongPressTimer = setTimeout( () => {
            this.isLongPress = true;
            console.log('【长按触发】index=', this.currentIndex);
            if (this.onLongPressCallback) {
                this.onLongPressCallback(this.currenIndex);
            }
        },this.LONG_PRESS_TIME * 1000);
    }

    private onTouchEnd(event: EventTouch) {
        this.clearTime();
        // 判断是否是长按
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

    private clearTime() {
        if (this.LongPressTimer) {
            clearTime(this.LongPressTimer); // 这个不知道是什么作用
            this.LongPressTimer = 0;
        }
    }


    /**
     * 调用方法，设置标签文本
     */
    public setTag(label: string) {
        this.currentLabel = label;
        console.log('【Item】设置文本', label);
        this.lblTag.label = label;
    }

}


