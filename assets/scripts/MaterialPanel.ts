// 处理素材上传和展示逻辑
/*
拆分为 数据层、视图层、交互层
1、数据层：用一个简单的字符串数组 string[] 存储素材的路径或ID
2、交互层：点击按钮 → 模拟“上传”动作 → 向数组添加一个新路径 → 刷新列表
3、视图层：遍历数组 → 动态实例化预制体（Item）→ 设置图片 → 放入ScrollView的Content节点下
*/

import { _decorator, SpriteFrame, Component, Node, Prefab, instantiate, Layout, ScrollView, find, Button,Sprite, resources } from 'cc';
import { MaterialItem } from './MaterialItem'; // 引入刚才写的Item脚本
const { ccclass, property } = _decorator;

@ccclass('MaterialPanel')
export class MaterialPanel extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null; // 绑定 MaterialItem.prefab

    @property(Node)
    contentNode: Node = null; // 绑定 ScrollView 下的 content 节点

    @property(Sprite)
    bigImageSprite: Sprite = null; // 弹窗里的大图

    @property(Node)
    previewPopup: Node = null; //弹窗根节点

    @property(Button)
    btnClose: Button = null; // 关闭按钮



    // 模拟的数据源：存储素材图片的路径
    private materialList: string[] = [];

    onLoad(){
        // 关闭按钮监听
        this.btnClose.node.on(Button.EventType.CLICK, this.hidePreview,this);

        // 弹窗默认隐藏
        this.previewPopup.active = false;

        // 1. 初始化： 确保 content 节点有 Layout 组件自动排列
        const layout = this.contentNode.getComponent(Layout);
        if (!layout) {
            // 如果没有，可以代码添加或提醒在编辑器检查
            console.warn("Content节点缺少Layout组件");
        }

        // 初始加载一些假数据测试
        //this.addMaterialToData("textures/default_material/spriteFrame");
        this.refreshListView();
    }

    /**
     * 绑定到 Button 的Click Events 中
     * 模拟点击上传按钮
     */
    onBtnUpLoadClick() {
        console.log("点击了上传按钮");

        // 2.模拟上传成功：往数据数组里加一个新路径
        // 实际项目中这里会是网络请求回调
        const newMaterialPath = "textures/bag/spriteFrame"; // 这里用同一张图测试，实际可以是不同路径
        this.addMaterialToData(newMaterialPath);
        console.log("当前素材数据列表：", this.materialList);
        //3.刷新界面
        this.refreshListView();
    }

    /**
     * 更新数据模型
     */
    private addMaterialToData(path: string) {
        this.materialList.push(path);
    }

    /**
     * 根据数据刷新列表视图
     * 最简版逻辑：每次清空重绘（适合数据量小，如<50个）
     */
    private refreshListView() {
        // A.清空当前列表显示
        this.contentNode.removeAllChildren();

        //B.遍历数据，创建对应的Item
        for (let i = 0; i < this.materialList.length; i++) {
            const path = this.materialList[i];

            // 实例化预制体
            const newItem = instantiate(this.itemPrefab);
            
            // 获取Item上的脚本组件并设置数据
            const itemComp = newItem.getComponent(MaterialItem);
            if (itemComp) {
                itemComp.setMaterial(path);
                itemComp.setPath(path);
                // 注入点击回调
                itemComp.setClickCallback(this.showPreview.bind(this));
            }

            // 添加到 Content 节点下，Layout会自动处理位置
            this.contentNode.addChild(newItem);
        }
    }
    

    /**显示大图预览 */
    private showPreview(path: string) {
        // 去掉末尾的 /spriteFrame
        const cleanPath = path.replace(/\/spriteFrame$/, '');
        console.log('【预览路径】', path);
        resources.load(path, SpriteFrame, (err,spriteFrame) => {
            if (err) return console.error(err);
            this.bigImageSprite.spriteFrame = spriteFrame;
            this.previewPopup.active = true;
        })
    }

    /** 关闭预览 */
    private hidePreview() {
        this.previewPopup.active = false;
    }
}


