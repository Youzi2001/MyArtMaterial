// 接收路径，显示图片
import { _decorator, Component, Node, Sprite, resources, SpriteFrame, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MaterialItem')
export class MaterialItem extends Component {
    @property(Sprite)
    spIcon: Sprite = null; // 在编辑器中绑定子节点的Sprite组件

    @property(Button)
    btnClose: Button = null; // 绑定Item根节点上的button

    private currentPath: string = '';
    private onClickCallback: (path: sting) => void = null;

    /** 外部注入：设置这一项对应的资源路径 */
    public setPath(path: string) {
        this.currentPath = path;
        console.log('【Item 设置路径】', path); //调试用
    }


    onLoad() {
        // 监听按钮点击
        this.btnClose.node.on(Button.EventType.CLICK, this.onItemClick, this);
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

    /** 由Panel注入点击回调 */
    public setClickCallback(cb: (path: string) => void) {
        this.onClickCallback = cb;
    }

    private onItemClick() {
        console.log('【Item 被点击，路径】', this.currentPath);   // 调试用
        if (this.onClickCallback) {
            this.onClickCallback(this.currentPath);
        }
    }

}

