// 接收路径，显示图片
import { _decorator, Component, Node, Sprite, resources, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MaterialItem')
export class MaterialItem extends Component {
    @property(Sprite)
    spIcon: Sprite = null; // 在编辑器中绑定子节点的Sprite组件

    /**
     * 外部调用此方法设置图片
     * @param path 相对 resources 目录的路径，不含扩展名
     */
    setMaterial(path: string) {
        // 动态加载图片
        resources.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error('加载图片失败：', err);
                return;
            }
            this.spIcon.spriteFrame = spriteFrame;
        });
    }

}

