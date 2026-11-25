import { _decorator, Component, Node, EventTouch,UITransform, tween, Vec3 } from 'cc';
import { AllData, STORAGE_KEY, createDefaultData } from '../common/DataTypes';
import { StorageManager } from '../common/StorageManager';
const { ccclass, property } = _decorator;

@ccclass('TagEditPage')
export class TagEditPage extends Component {
    @property(Node)
    panel: Node = null;

    @property(Node)
    drawer: Node = null;

    @property(Node)
    top: Node = null;

    @property(Node)
    allTagList: Node = null;

    private topHeight: number = 0;

    private startTouchY: number = 0;    //手指按下时的y
    private startPanelY: number = 0;    //面板按下时的y
    private panelHeight: number = 0;

    private isDragging: boolean = false;

    private allTagList: stirng[] = [];

    onLoad() {
        const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
        this.allTagList = allData.tagList || [];
        this.panelHeight = this.panel.getComponent(UITransform).height;
        this.topHeight = this.top.getComponent(UITransform).height;

        this.panel.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.panel.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.panel.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.panel.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    //1.手指按下：记下起点
    private onTouchStart(e:EventTouch) {
        if (!this.isInTop(e.getUILocation())) {
            this.isDragging = false;
            return;
        }
        this.isDragging = true;
        this.startTouchY = e.getUILocation().y;
        this.startPanelY = this.panel.position.y;
    }

    //2.手指移动：算位移，改面板y
    private onTouchMove(e: EventTouch) {
        if (!this.isDragging) return;

        const nowY = e.getUILocation().y;
        const delta = nowY - this.startTouchY;
        let targetY = this.startPanelY + delta;

        // 关键：加载【最低点，最高点】之间
        const minY = -this.panelHeight;
        const maxY = -50;
        targetY = Math.max(minY,Math.min(maxY, targetY));

        this.panel.setPosition(0, targetY, 0);
    }

    //3.手指松开：这一轮先什么都不做，只打日志
    private onTouchEnd(e: EventTouch) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const currentY = this.panel.position.y;
        const openY = -40;
        const closeY = -this.panelHeight-100;

        // 算当前进度
        const progress = (currentY - closeY) / (openY - closeY);

        // 超过阈值就展开，否则关闭
        const targetY = progress > 0.3 ? openY : closeY;

        // 平滑滑过去
        tween(this.panel)
            .to(0.25, { position: new Vec3(0, targetY, 0)}, { easing: 'quadOut'})
            .call(() => {
                if (targetY == closeY) {
                    this.closePanel();
                }
            })
            .start();
    }

    private isInTop(touchPos: Vec2): boolean {
        const topTransform = this.top.getComponent(UITransform);
        const localPos = topTransform.convertToNodeSpaceAR(
            new Vec3(touchPos.x, touchPos.y, 0)
        );
        const w = topTransform.width;
        const h = topTransform.height;
        const ax = topTransform.anchorX;
        const ay = topTransform.anchorY;

        return localPos.x >= -w * ax && localPos.x <= w * (1-ax) 
            && localPos.y >= -h * ay && localPos.y <= h * (1-ay);
    }

    public openPanel() {
        this.drawer.active = true;
        this.panel.setPosition(0, -this.panelHeight, 0);
        tween(this.panel)
            .to(0.25, { position: new Vec3(0,-40,0) }, { easing: 'quadOut' })
            .start();
    }

    public closePanel() {
        this.drawer.active = false;
    }

    private refreshAllTagListView() {
        this.allTagList.removeAllChildren();
    }
}


