/**
 * 接收完整数据
 */

import { _decorator, Component, Node, Sprite,resources,SpriteFrame,UITransform  } from 'cc';
import { MaterialData } from '../00_common/02_DataTypes';
const { ccclass, property } = _decorator;

@ccclass('MaterialDetailPage')
export class MaterialDetailPage extends Component {
    @property(Sprite)
    SpImage: Sprite = null;

    private _data: MaterialData = null;

    public setData(data: MaterialData) {
        this._data = data;
        this.refreshView();
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

}


