/**
 * 接收完整数据
 */

import { _decorator, Component, Button, Node, Sprite,resources,SpriteFrame,UITransform  } from 'cc';
import { MaterialData } from '../00_common/02_DataTypes';
import { AllData, STORAGE_KEY, createDefaultData } from '../00_common/02_DataTypes';
import { StorageManager } from '../00_common/03_StorageManager';
import EventManager, { EventName } from '../00_common/05_EventManager';
import { TagEditPanel } from '../03_tagEdit/01_TagEditPanel';
const { ccclass, property } = _decorator;

@ccclass('MaterialDetailPage')
export class MaterialDetailPage extends Component {
    @property(Sprite)
    SpImage: Sprite = null;

    @property(Button)
    btnTagEdit: Button = null;

    @property(TagEditPanel)
    TagEditPanel: TagEditPanel = null;

    private _data: MaterialData = null;
    // 绑定的回调函数，必须保留引用以便移除监听
    private _onDataChangedCallback: (data: any) => void;

    onEnable() {
        // 注册监听
        // 使用箭头函数或bind确保this指向当前组件实例
        this._onDataChangedCallback = (data: any) => {
            this.handleDataUpdata(data);
            //console.log("注册监听")
        };

        EventManager.on(EventName.MATERIAL_DATA_CHANGED, this._onDataChangedCallback, this);
    }

    onDisable() {
        // 取消监听，防止内存泄露
        if (this._onDataChangedCallback) {
            EventManager.off(EventName.MATERIAL_DATA_CHANGED, this._onDataChangedCallback, this);
        }
    }

    private handleDataUpdata(data: any) {
        console.log('接收到广播：',data);

        // 根据数据类型刷新UI
        if (data === this._data.id) {
            const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
            this._data = allData.materialList.find(m => m.id = this._data.id);
            this.refreshView();
        }
    }

    onLoad() {
        this.btnTagEdit.node.on(Button.EventType.CLICK, this.onBtnOpenTagEditPage, this);
    }

    public setData(data: MaterialData) {
        this._data = data;
        this.refreshView();
    }

    public setTagEditPanelNode(TagEditPanel:TagEditPanel) {
        this.TagEditPanel = TagEditPanel;
    }

    private refreshView() {
        if (!this._data) return;
        const ratio = this._data.height / this._data.width;
        const displayWidth = 600;
        const displayHeight = displayWidth * ratio;
        this.loadImage(this._data.fileName,displayWidth,displayHeight);
    }

    private loadImage(path: string, width: number, height:number) {
        // 动态加载图片,用 resources.load 加载，显式指定 SpriteFrame 类型
        resources.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error('加载图片失败：', err);
                return;
            }
            this.SpImage.spriteFrame = spriteFrame;
            const imageUI = this.SpImage.getComponent(UITransform);
            imageUI.setContentSize(width,height);
        });
    }

    onBtnOpenTagEditPage() {
        this.TagEditPanel.openPanel(this._data);
    }

}


