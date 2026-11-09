// 接收路径，显示图片
import { _decorator, Component, Node, Sprite, resources, SpriteFrame, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MaterialItem')
export class MaterialItem extends Component {
    @property(Sprite)
    spIcon: Sprite = null; // 在编辑器中绑定子节点的Sprite组件

    // @property(Button)
    // btnItem: Button = null; // 绑定Item根节点上的button

    private currentPath: string = '';
    private currentIndex: number = -1; // 记录在列表中的位置


    private onClickCallback: (path: string) => void = null;
    private onLongPressCallback: (index: number) => void = null; // 长按回调


    private LongPressTimer: number = 0; // 计时器句柄
    private isLongPress: boolean = false; // 标记是否已触发长按
    private readonly LONG_PRESS_TIME = 0.8; // 长按阈值（秒）




    // ================== 注入方法 ========================

    /** 外部注入：设置这一项对应的资源路径 */
    public setPath(path: string) {
        this.currentPath = path;
        console.log('【Item 设置路径】', path); //调试用
    }


    public setIndex(index: number) {
        this.currentIndex = index;
    }

    public setClickCallback(cb: (path: string) => void) {
        this.onClickCallback = cb;
    }

    public setLongPressCallback(cb: (index: number) => void) {
        this.onLongPressCallback = cb;
    }



    // ================== 生命周期 ========================


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



    // ================== 触摸事件 ========================


    private onTouchStart(event: EventTouch) {
        this.isLongPress = false;
        this.clearTime();

        // 启动计时器
        this.LongPressTimer = setTimeout(() => {
           this.isLongPress = true;
           console.log('【长按触发】index=', this.currentIndex); 
           if (this.onLongPressCallback) {
                this.onLongPressCallback(this.currentIndex);
           }
        }, this.LONG_PRESS_TIME * 1000);
    }


    private onTouchEnd(event: EventTouch){
        this.clearTime();

        // 如果是长按，就不再触发点击
        if (this.isLongPress) {
            this.isLongPress = false;
            console.log('【长按结束，不触发点击】');
            return;
        }

        // 短按 → 触发点击
        if (this.onClickCallback) {
            this.onClickCallback(this.currentPath);
        }
    }


    private onTouchCancel(event: EventTouch) {
        this.clearTime();
        this.isLongPress = false;
    }


    private clearTime() {
        if (this.LongPressTimer) {
            clearTimeout(this.LongPressTimer);
            this.LongPressTimer = 0;
        }
    }








    /**
     * 外部调用此方法设置图片
     * @param path 相对 resources 目录的路径，不含扩展名
     */
    public setMaterial(path: string) {
        // 动态加载图片,用 resources.load 加载，显式指定 SpriteFrame 类型
        resources.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error('加载图片失败：', err);
                return;
            }
            this.spIcon.spriteFrame = spriteFrame;
        });
    }

}

