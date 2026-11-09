import { _decorator, Component, Node, Label, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ConfirmDialog')
export class ConfirmDialog extends Component {

    @property(Label)
    titleLabel: Label = null;

    @property(Label)
    contentLabel: Label = null;

    @property(Button)
    btnYes: Button = null;

    @property(Button)
    btnNo: Button = null;

    // 保存回调
    private onConfirmCb: () => void = null;
    private onCancelCb: () => void = null;

    onLoad() {
        // 绑定按钮点击
        this.btnYes.node.on(Button.EventType.CLICK, this.onClickYes, this);
        this.btnNo.node.on(Button.EventType.CLICK, this.onClickNo, this);

        // 默认隐藏
        this.node.active = false;
    }

    /**
     * 打开弹窗
     * @param title 标题
     * @param content 内容
     * @param onConfirm 点"确定"的回调
     * @param onCancel 点"取消"的回调（可选）
     */
    public open(title: string, content: string, onConfirm: () => void, onCancel?: () => void) {
        if (this.titleLabel) this.titleLabel.string = title;
        if (this.contentLabel) this.contentLabel.string = content;

        this.onConfirmCb = onConfirm;
        this.onCancelCb = onCancel;

        this.node.active = true;
    }

    /** 关闭弹窗 */
    public close() {
        this.node.active = false;
        this.onConfirmCb = null;
        this.onCancelCb = null;
    }

    private onClickYes() {
        const cb = this.onConfirmCb;
        this.close();
        if (cb) cb();
    }

    private onClickNo() {
        const cb = this.onCancelCb;
        this.close();
        if (cb) cb();
    }
}