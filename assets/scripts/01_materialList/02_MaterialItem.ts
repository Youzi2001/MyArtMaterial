/**
 * 是一个通用列表项（通用零件：只做“通用的事”，不做“具体的事”）
 * 只负责：
 * 1、显示图片
 * 2、被点击时，通知外面
 * 
 * 属于展示组件，只需要把数据画出来，所以直接接收完整数据，后续增加字段不需要该接口，与数据层解耦
 */

import { _decorator, Component, Node, Sprite, resources, SpriteFrame, Button } from 'cc';
import { MaterialData } from '../00_common/02_DataTypes';
const { ccclass, property } = _decorator;

@ccclass('MaterialItem')
export class MaterialItem extends Component {
    @property(Sprite)
    spIcon: Sprite = null; // 在编辑器中绑定子节点的Sprite组件

    @property(Button)
    btnItem: Button = null; // 绑定Item根节点上的button

    private _data: MaterialData = null;

    /** 接收完整素材数据 */
    public setData(data: MaterialData) {
        this._data = data;
        this.refreshView();
    }

    private refreshView() {
        if (!this._data) return;
        this.loadCover(this._data.fileName);
    }

    private loadCover(path:stirng) {
        resources.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error('加载图片失败：', err);
                return;
            }
            this.spIcon.spriteFrame = spriteFrame;
        });
    }
}

