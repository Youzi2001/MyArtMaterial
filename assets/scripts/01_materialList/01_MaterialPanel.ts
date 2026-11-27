// 处理素材上传和展示逻辑
/*
拆分为 数据层、视图层、交互层
1、数据层：用一个简单的字符串数组 string[] 存储素材的路径或ID
2、交互层：点击按钮 → 模拟“上传”动作 → 向数组添加一个新路径 → 刷新列表
3、视图层：遍历数组 → 动态实例化预制体（Item）→ 设置图片 → 放入ScrollView的Content节点下
*/

import { _decorator,PageView, director,SpriteFrame, UITransform, Component, Node, Prefab, instantiate, Layout, ScrollView, find, Button,Sprite, resources } from 'cc';
import { AllData, STORAGE_KEY, createDefaultData } from '../00_common/02_DataTypes';
import { StorageManager } from '../00_common/03_StorageManager';
import { MaterialItem } from './02_MaterialItem'; // 引入刚才写的Item脚本
const { ccclass, property } = _decorator;

@ccclass('MaterialPanel')
export class MaterialPanel extends Component {
    @property(Prefab)
    itemPrefab: Prefab = null;              // 素材项预制体

    @property(Node)
    materialContent: Node = null;           // 素材列表容器节点

    @property(Node)
    col0: Node = null;                      // 第一列列表

    @property(Node)
    col1: Node = null;                      // 第二列列表

    @property(Button)
    btnUpload: Button = null;               // 上传素材按钮

    @property(Node)
    pageMaterialDetail: Node = null;        // 素材详情页根节点

    @property(Node)
    pageTagEdit: Node = null;               // 标签编辑页根节点



    private colHeight0 = 0;
    private colHeight1 = 0;

    // 模拟的数据源：存储素材图片的路径
    private materialList: string[] = [];



    onLoad(){
        // 加载数据
        const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
        this.materialList = allData.materialList || [];

        // 隐藏其他页面
        this.pageMaterialDetail.active = false;
        this.pageTagEdit.active = false;

        // 刷新页面
        this.refreshListView();
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
                fileName: newMaterialPath,
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
                itemComp.setData(material);
                // 注入点击回调
                //itemComp.setClickCallback(this.showPreview.bind(this));
                //itemComp.setClickCallback(this.showMaterialDetailPage.bind(this));
            }

            //5、加到目标列
            targetCol.addChild(newItem);
        }
        
        // C.【关键】撑开content高度
        const contentUI = this.materialContent.getComponent(UITransform);
        if (contentUI) {
            contentUI.setContentSize(contentUI.width, Math.max(this.colHeight0,this.colHeight1));
        }
    }


    private openMaterialDetailPage(data: MaterialData) {
        this.pageMaterialDetail.active = true;
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


