// 处理素材上传和展示逻辑
/*
拆分为 数据层、视图层、交互层
1、数据层：用一个简单的字符串数组 string[] 存储素材的路径或ID
2、交互层：点击按钮 → 模拟“上传”动作 → 向数组添加一个新路径 → 刷新列表
3、视图层：遍历数组 → 动态实例化预制体（Item）→ 设置图片 → 放入ScrollView的Content节点下
*/

import { _decorator, director,SpriteFrame, UITransform, Component, Node, Prefab, instantiate, Layout, ScrollView, find, Button,Sprite, resources } from 'cc';
import { MaterialItem } from './MaterialItem'; // 引入刚才写的Item脚本
import { ConfirmDialog } from '../common/ConfirmDialog';
import { AllData, STORAGE_KEY, createDefaultData } from '../common/DataTypes';
import { StorageManager } from '../common/StorageManager';
const { ccclass, property } = _decorator;

@ccclass('MaterialPanel')
export class MaterialPanel extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null; // 绑定 MaterialItem.prefab

    @property(Node)
    contentNode: Node = null; // 绑定 ScrollView 下的 content 节点

    @property(Node)
    col0: Node = null;

    @property(Node)
    col1: Node = null;

    @property(Sprite)
    bigImageSprite: Sprite = null; // 弹窗里的大图

    @property(Node)
    previewPopup: Node = null; //弹窗根节点

    @property(Button)
    btnClose: Button = null; // 关闭按钮

    @property(Prefab)
    confirmDialogPrefab: Prefab = null;


    private confirmDialogNode: Node = null;
    private confirmDialogComp: ConfirmDialog = null;

    private colHeight0 = 0;
    private colHeight1 = 0;

    // 模拟的数据源：存储素材图片的路径
    private materialList: string[] = [];



    onLoad(){
        const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
        this.materialList = allData.materialList || [];
        console.log(this.materialList);

        // 关闭按钮监听
        this.btnClose.node.on(Button.EventType.CLICK, this.hidePreview,this);

        // 弹窗默认隐藏
        this.previewPopup.active = false;
        this.refreshListView();


       // 预先实例化弹窗，挂到 Canvas 下
        if (this.confirmDialogPrefab) {
            this.confirmDialogNode = instantiate(this.confirmDialogPrefab);
            this.confirmDialogComp = this.confirmDialogNode.getComponent(ConfirmDialog);

            // 挂到 Canvas 下（和 MaterialPanel 同级或更高）
            const canvas = find('Canvas');
            canvas.addChild(this.confirmDialogNode);
        }
    }


    /**
     * 绑定到 Button 的Click Events 中
     * 模拟点击上传按钮
     */
    onBtnUploadClick() {
        console.log("点击了上传按钮");
        // 2.模拟上传成功：往数据数组里加一个新路径
        // 实际项目中这里会是网络请求回调
        const newMaterialPath = "textures/bag/spriteFrame"; // 这里用同一张图测试，实际可以是不同路径
        resources.load(newMaterialPath, SpriteFrame, (err,spriteFrame) => {
            if (err) {
                console.log(err);
                return;
            }
            const originalWidth = spriteFrame.width;
            const originalHeight = spriteFrame.height;
        
            const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
            const newMaterial : MaterialData = {
                id: allData.nextIds.material,
                name: newMaterialPath,
                tags: [],
                height: originalHeight,
                width: originalWidth,
                createTime: Date.now()
            };

            allData.nextIds.material += 1;
            allData.materialList.push(newMaterial);
            StorageManager.inst.setObj(STORAGE_KEY, allData);

            this.addMaterialToData(newMaterial);
            this.refreshListView();
        });
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
        //this.contentNode.removeAllChildren();
        this.col0.removeAllChildren();
        this.col1.removeAllChildren();
        this.colHeight0 = 0;
        this.colHeight1 = 0;

        const itemGap = 10;

        //B.遍历数据，创建对应的Item
        for (let i = 0; i < this.materialList.length; i++) {
            const material = this.materialList[i];
            const path = material.name;
            const ratio = material.height / material.width;
            const displayWidth = 355;
            const displayHeight = displayWidth * ratio
            console.log("图片尺寸：",displayWidth,displayHeight)

            // 1、实例化预制体 + 设置尺寸锚点
            const newItem = instantiate(this.itemPrefab);
            const itemUI = newItem.getComponent(UITransform);
            if(itemUI) {
                itemUI.setContentSize(displayWidth,displayHeight);
                itemUI.setAnchorPoint(0.5,1);
            }

            // 2、【关键】选列：找矮的那一列
            let targetCol: Node;
            let targetY: number;
            if (this.colHeight0 <= this.colHeight1) {
                targetCol = this.col0;
                targetY = -this.colHeight0;
                this.colHeight0 += displayHeight + itemGap;
            } else {
                targetCol = this.col1;
                targetY = -this.colHeight1;
                this.colHeight1 += displayHeight + itemGap;
            }

            // 3.【关键】设位置
            newItem.setPosition(0, targetY, 0);

            // 4、获取Item上的脚本组件并设置数据
            const itemComp = newItem.getComponent(MaterialItem);
            if (itemComp) {
                // 注入路径和索引
                itemComp.setMaterial(path);
                itemComp.setIndex(i);
                //itemComp.setPath(path);
                // 注入点击回调
                itemComp.setClickCallback(this.showPreview.bind(this));
                // 注入长按回调
                itemComp.setLongPressCallback(this.onItemLongPress.bind(this));
            }

            //5、加到目标列
            targetCol.addChild(newItem);
        }
        
        // C.【关键】撑开content高度
        const contentUI = this.contentNode.getComponent(UITransform);
        if (contentUI) {
            contentUI.setContentSize(contentUI.width, Math.max(this.colHeight0,this.colHeight1));
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


    private onItemLongPress(index: number) {
        console.log('【Panel收到长按】 index=', index);

        if (!this.confirmDialogComp) {
            console.error('弹窗组件未初始化');
            return;
        }

        this.confirmDialogComp.open(
            '确认删除',
            '确定要删除这条素材吗？',
            () => {
                // 点确定
                console.log('用户确认删除 index= ', index);
                this.deleteMaterial(index);
            },
            () => {
                // 点取消
                console.log('用户取消删除');
            }
        )
    }


    /** 删除指定索引的素材 */
    private deleteMaterial(index: number) {
        // 边界检查
        if(index < 0 || index >= this.materialList.length) {
            console.warn('删除失败：索引越界', index);
            return;
        }

        // 从数据列表删除
        const removed = this.materialList.splice(index,1);
        console.log('【已删除】', removed[0]);
        console.log('【剩余数据】', this.materialList);

        // 刷新列表
        this.refreshListView();
    }
}


