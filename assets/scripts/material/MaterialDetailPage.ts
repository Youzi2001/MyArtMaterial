import { _decorator, Component, Node, Sprite,resources,SpriteFrame,UITransform  } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MaterialDetailPage')
export class MaterialDetailPage extends Component {
    @property(Sprite)
    image: Sprite = null;

    private setDetailPageImage(path: string, width: number, height:number) {
        console.log('【Item 设置路径】', path); //调试用
        // 动态加载图片,用 resources.load 加载，显式指定 SpriteFrame 类型
        resources.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error('加载图片失败：', err);
                return;
            }
            this.image.spriteFrame = spriteFrame;
            const imageUI = this.image.getComponent(UITransform);
            imageUI.setContentSize(width,height);
        });
    }
}


