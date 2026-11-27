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
    private _onClickCb: (data: MaterialData, index: number) => void =null; // 外部回调
    private _index: number = -1;        // 当前素材位置

    onLoad() {
        // 绑定点击
        this.btnItem.node.on(Button.EventType.CLICK, this.onItemClick, this);
    }

    onDestroy() {
        // 解绑，防止内存泄漏
        this.btnItem.node.off(Button.EventType.CLICK, this.onItemClick, this);
    }


    /** 接收完整素材数据 */
    public setData(data: MaterialData, index: number) {
        this._data = data;
        this._index = index;
        this.refreshView();
    }

    /** 外部注册点击回调 */
    public setClickCallback(cb: (data: MaterialData, index: number) => void) {
        this._onClickCb = cb;
    }

    private onItemClick() {
        if (!this._data) return;
        this._onClickCb?.(this._data, this._index);  // 把数据抛出去
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

