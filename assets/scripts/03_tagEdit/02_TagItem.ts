/**
 * 通过4个可配置维度，设置标签状态
 * 1、尺寸档位（大、小）：整体尺寸、字号
 * 2、边框：有无
 * 3、选中态（选中、未选中）：颜色（背景、边框、文字）
 * 4、关闭按钮（显示、隐藏）
 * 
 * size: LARGE\SMALL
 * selected: false\true
 * showBorder: true\false
 * showClose: true\false
 * 
 */
/**
 * 标签状态样式表
 */

import { _decorator, Component, Node, Label, Button, Graphics, UITransform, Color, Sprite, UI } from 'cc';
const { ccclass, property } = _decorator;

/** 尺寸档位 */
export enum TagSize {
    LARGE = 0,      // 编辑页 / 编辑页已选列表
    SMALL = 1,      // 作品详情页 / 作品列表页
}

/** 尺寸样式表：一个档位打包所有尺寸参数 */
interface TagStyle {
    fontSize: number;
    paddingH: number;
    paddingV: number;
    borderWidth: number;
    radius: number;
}

const STYLE_MAP: Record<TagSize, TagStyle> = {
    [TagSize.LARGE]: { fontSize: 22, paddingH: 20, paddingV: 10, borderWidth: 3, radius: 6},
    [TagSize.SMALL]: { fontSize: 18, paddingH: 12, paddingV: 6, borderWidth: 2, radius: 4},
};

/** 颜色方案：一套选中，一套未选中 */
interface TagColors {
    bg: Color;
    border: Color;
    text: Color;
}

const COLOR_SELECTED: TagColors = {
    bg: new Color(220, 240, 255, 255),
    border: new Color(50, 150, 255, 255),
    text: new Color(50, 150, 255, 255),
};

const COLOR_UNSELECTED: TagColors = {
    bg: new Color(255, 255, 255, 255),
    border: new Color(200, 200, 200, 255),
    text: new Color(0, 0, 0, 255),
};

export interface TagConfig {
    size?: TagSize;
    selected?: boolean;
    showBorder?: boolean;
    showClose?: boolean;
}


//==================================== 主脚本 ===================================

@ccclass('TagItem')
export class TagItem extends Component {
    @property(Label)
    lblTag: Label = null;

    @property(Button)
    btnClose: Button = null;

    @property(Label)
    lblClose: Label = null;

    @property(Graphics)
    graphics: Graphics = null;

    private size: TagSize = TagSize.LARGE;
    private selected: boolean = false;
    private showBorder: boolean = true;
    private showClose: boolean = false;
    private text: string = '';

    private _clickCallback: tagClickback = null;
    private tagClickback: (path: string) => void = null;     // 定义点击回调

    //=================== 注入方法 =====================
    public setClickCallback(cb: tagClickback) {
        this._clickCallback = cb;
    }


    /**
     * 对外统一接口：一次配置所有状态
     */
    public setTag(text: string, config?: TagConfig) {
        this.size = config?.size ?? TagSize.LARGE;
        this.selected = config?.selected ?? false;
        this.showBorder = config?.showBorder ?? true;
        this.showClose = config?.showClose ?? false;

        //1.关闭按钮显隐
        this.setClosebtn(this.showClose);

        //2.设文字（会改变Label尺寸）
        this.text = text;
        this.lblTag.string = text;
        // 强制Label立刻计算文本尺寸，不用等待下一帧
        this.lblTag.updateRenderData(true);
        // 手动把标签节点的宽高同步设置为Label尺寸+内边距
        const labelTransform = this.lblTag.node.getComponent(UITransform);
        const selfTransform = this.node.getComponent(UITransform);
        const paddingX = 24;
        const paddingY = 12;
        const closeBtnWidth = this.showClose ? 24 : 0;
        selfTransform.setContentSize(
            labelTransform.width + paddingX * 2 + closeBtnWidth,
            labelTransform.height + paddingY * 2
        );


        // 最后设置选中态、关闭等样式
        //3.应用尺寸样式（字号、内边距）
        this.applySizeStyle();

        //4.应用颜色（背景、边框、文字）
        this.applyColor();

        //5.等一帧后重绘（Label尺寸下一帧才会更新）
        this.scheduleOnce(() => {
            this.redraw();
        });
    }

    /** 只切选中态（列表页点击切换时用，最快） */
    public setSelected(selected: boolean) {
        this.selected = selected;
        this.applyColor();
        this.redraw();
    }

    private setClosebtn(showClose: boolean) {
        this.showClose = showClose;
        this.btnClose.node.active = this.showClose;
    }

    /** 应用尺寸档位 */
    private applySizeStyle() {
        const style = STYLE_MAP[this.size];
        this.lblTag.fontSize = style.fontSize;

        // 强制刷新 Label 的 UITransform 尺寸
        this.lblTag.updateRenderData(true);     // true = 强制重算
    }

    /** 应用选中/未选中颜色 */
    private applyColor() {
        const colors = this.selected ? COLOR_SELECTED : COLOR_UNSELECTED;

        // 文字色
        this.lblTag.color = colors.text;
        this.lblClose.color = colors.text;

        // 背景色
        const bg = this.node.getChildByName('bg');
    }

    /** 重绘背景+边框 */
    private redraw() {
        if (!this.graphics || !this.lblTag) return;

        const style = STYLE_MAP[this.size];
        const labelUI = this.lblTag.getComponent(UITransform)!;
        const w = labelUI.width + style.paddingH * 2;
        //const h = labelUI.height + style.paddingV * 2;
        const h = labelUI.height;

        const g = this.graphics;
        g.clear();

        const colors = this.selected ? COLOR_SELECTED : COLOR_UNSELECTED;

        //1.背景填充
        g.fillColor = colors.bg;
        g.roundRect(Math.round(-w/2), Math.round(-h/2), w, h, style.radius);
        g.fill();

        //2.边框
        if (this.showBorder) {
            g.lineWidth = style.borderWidth;
            g.strokeColor = colors.border;
            g.roundRect(Math.round(-w/2), Math.round(-h/2), w, h, style.radius);
            g.stroke();
        }
    }

    // start() {
    //     this.setTag("风景", {size: TagSize.LARGE, selected:true, showBorder: true});
    // }


    onLoad() {
        this.lblTag.node.on(Node.EventType.TOUCH_END,this.onClickSelf,this);
    }

    private onClickSelf() {
        if (this._clickCallback) {
            this._clickCallback(this);
        }
    }
}


