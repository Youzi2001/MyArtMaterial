/**
 * 接收完整数据
 */

import { _decorator, Component, Button, Node, Sprite,resources,SpriteFrame,UITransform  } from 'cc';
import { MaterialData } from '../00_common/02_DataTypes';
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
        this.TagEditPanel.node.active = true;
        this.TagEditPanel.setData(this._data);
    }

}


