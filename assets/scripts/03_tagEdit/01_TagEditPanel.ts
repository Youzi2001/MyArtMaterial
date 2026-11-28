import { _decorator, Component, Node, instantiate, Sprite,Button, Color, Label, Layout, EventTouch,UITransform, tween, Vec3, Prefab } from 'cc';
import { AllData, STORAGE_KEY, createDefaultData } from '../00_common/02_DataTypes';
import { StorageManager } from '../00_common/03_StorageManager';
import { FlowLayout } from '../00_common/04_FlowLayout';
import { MaterialData, TagData } from '../00_common/02_DataTypes';
import EventManager, { EventName } from '../00_common/05_EventManager';
import { TagItem, TagSize } from './02_TagItem';
const { ccclass, property } = _decorator;

@ccclass('TagEditPanel')
export class TagEditPanel extends Component {
    @property(Prefab)
    tagItemPrefab: Prefab = null;

    @property(Prefab)
    btnAddTagPrefab: Prefab = null;

    @property(Node)
    panel: Node = null;

    @property(Node)
    drawer: Node = null;

    @property(Node)
    top: Node = null;

    @property(Node)
    allTagListNode: Node = null;

    @property(Node)
    selectedTagListNode: Node = null;

    @property(Node)
    selectedWrapper: Node = null;

    @property(Label)
    lblNotag: Label = null;

    @property(Button)
    btnCorrect: Button = null;

    private topHeight: number = 0;

    private startTouchY: number = 0;    //手指按下时的y
    private startPanelY: number = 0;    //面板按下时的y
    private panelHeight: number = 0;

    private isDragging: boolean = false;
    private isCorrect: boolean = false;

    private allTagList: TagData[] = [];
    private selectedTagItemList: TagItem[] = [];
    private saveTagIdLsit: number[] = [];
    private _data: MaterialData = null;


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
                    this.isCorrect = false;
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


    /** 点击确认按钮，保存修改信息 */
    public onBtnCorrect() {
        this.isCorrect = true;
        this.closePanel();
    }


    public openPanel(data?: any) {
        this.isCorrect = false;
        if (data) {
            this.setData(data);
        }
        this.drawer.active = true;
        this.refreshAllTagListView();
        this.refreshSelectedTagListView();

        this.panelHeight = this.panel.getComponent(UITransform).height;
        this.panel.setPosition(0, -this.panelHeight, 0);
        tween(this.panel)
            .to(0.25, { position: new Vec3(0,-40,0) }, { easing: 'quadOut' })
            .start();
    }

    public closePanel() {
        this.drawer.active = false;
        this.panel.setPosition(0,-this.panelHeight,0);
        if (this.isCorrect) {
            const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
            const material = allData.materialList.find(m => m.id = this._data.id);
            material.tags = this.saveTagIdLsit;
            StorageManager.inst.setObj(STORAGE_KEY,allData);
            console.log("关闭时最终保存数据：",allData);

            // 保存完，广播数据变了，带上被改的素材id
            EventManager.emit(EventName.MATERIAL_DATA_CHANGED,this._data.id);
        }
        this.selectedTagItemList = [];
        this.saveTagIdLsit = [];
    }

    private refreshAllTagListView() {
        this.allTagListNode.removeAllChildren();
        for (let i = 0; i < this.allTagList.length; i ++) {
            const tag = this.allTagList[i];
            const tagText = tag.name;
            let hasSelected = this._data.tags.includes(tag.id);

            const newItem = instantiate(this.tagItemPrefab);
            const itemComp = newItem.getComponent(TagItem);
            if (itemComp) {
                itemComp.setTag(tag.id, tagText, {size: TagSize.LARGE, selected: hasSelected, showBorder: true, showClose:false});
                itemComp.setClickCallback((clickedItem: TagItem) => {
                    this.changeTagStyle(clickedItem);
                });
            }
            this.allTagListNode.addChild(newItem);

            if (hasSelected) {
                this.selectedTagItemList.push(itemComp);
                this.saveTagIdLsit.push(tag.id);
            }
        }

        const btnAddTagNode = instantiate(this.btnAddTagPrefab); 
        this.allTagListNode.addChild(btnAddTagNode);

        // 等一帧，让tagitem的尺寸计算完
        this.scheduleOnce(() => {
            const flowLayout = this.allTagListNode.getComponent(FlowLayout);
            if (flowLayout) {
                flowLayout.updateLayout();
            }
        }, 0);
    }

    private refreshSelectedTagListView() {

        const hasSelected = this.selectedTagItemList.length > 0;
        const flowTransform = this.selectedTagListNode.getComponent(UITransform);

        this.lblNotag.node.active = !hasSelected;
        this.selectedTagListNode.removeAllChildren();

        for (let i=0; i<this.saveTagIdLsit.length; i++) {
            const tagitem = this.selectedTagItemList[i];
            const tagText = tagitem.text;
            const newItem = instantiate(this.tagItemPrefab);
            const itemComp = newItem.getComponent(TagItem);
            if (itemComp) {
                itemComp.setTag(tagitem.id,tagText, {size: TagSize.LARGE, selected:true, showBorder: true, showClose:true});
                itemComp.setBtnCloseClickCallback((clickedItem: TagItem) => {
                    this.onTagCloseBtnClick(clickedItem,tagitem);
                });
            }
            const innerLayouts = newItem.getComponentsInChildren(Layout);
            for (const l of innerLayouts) {
                l.updateLayout();
            }

            this.selectedTagListNode.addChild(newItem);
        }

        const flowLayout = this.selectedTagListNode.getComponent(FlowLayout);
        if (flowLayout) {
            flowLayout.updateLayout();
        }
    }

    private changeTagStyle(item:TagItem) {
        const newSelected = !item.selected;
        item.setSelected(newSelected);

        // 如果新状态为true，向已选列表中添加标签，反之，删除标签
        if (newSelected) {
            this.selectedTagItemList.push(item);
            this.saveTagIdLsit.push(item.id);
        } else {
            const index = this.saveTagIdLsit.indexOf(item.id);
            this.saveTagIdLsit.splice(index,1);
            this.selectedTagItemList.splice(index,1);
        }

        this.refreshSelectedTagListView();
    }

    private onTagCloseBtnClick(selectedItem:TagItem,item:TagItem) {
        this.changeTagStyle(selectedItem);

        const newSelected = !item.selected;
        item.setSelected(newSelected);
    }

    private setData(data:MaterialData) {
        this._data = data;
        this._selectedTagIdList = this._data.tags;
        console.log("当前素材数据：",this._data);
    }
}


