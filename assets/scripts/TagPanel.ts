/**
 * 处理标签新建和展示逻辑
 * 先不建立缓存
 * 只做点击新建标签、展示、长按删除
 */

import { _decorator, Component, Node, find, Prefab, Content, Button, EditBox, instantiate } from 'cc';
import { ConfirmDialog } from './ConfirmDialog';
import { TagItem } from './MaterialItem'; 
const { ccclass, property } = _decorator;

@ccclass('TagPanel')
export class TagPanel extends Component {
    /**
     * 当前页面需要用到的组件
     * 1、滚动展示框（content）
     * 2、点击新建按钮
     * 3、标签预制体
     * 4、新建弹窗
     * 5、删除确认弹窗
     */
    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    contentNode: Node = null;

    @property(Button)
    btnCreat: Button = null;

    @property(Prefab)
    confirmDialogPrefab: Prefab = null;

    @property(Node)
    creatPopup: Node = null;    //弹窗根节点

    @property(EditBox)
    editBox: EditBox = null;

    @property(Button)
    btnYes: Button = null;

    @property(Button)
    btnNo: Button = null;


    private confirmDialogNode: Node = null;
    private confirmDialogComp: ConfirmDialog = null;    // 这两行代码不知道是什么作用

    private tagList: string[] = []; // 存放标签

    onLoad() {
        this.creatPopup.active = false;
        
        // 初始化
        this.refreshListView();

        // 预先实例化弹窗
        if (this.confirmDialogPrefab) {
            this.confirmDialogNode = instantiate(this.confirmDialogPrefab);
            this.confirmDialogComp = this.confirmDialogNode.getComponent(ConfirmDialog);

            const canvas = find('Canvas');
            canvas.addChild(this.confirmDialogNode);
        }


    }


    /**
     * 滚动视图刷新方法
     * 每次清空重绘
     */
    private refreshListView() {
        // 清空当前列表显示
        this.contentNode.removeAllChildren();

        // 遍历数据列表，创建对应的item
        for (let i = 0; i < this.tagList.length; i++) {
            const label = this.tagList[i];

            // 实例化预制体
            const newItem = instantiate(this.itemPrefab);

            // 获取item上的脚本组件并设置数据
            const itemComp = newItem.getComponent(TagItem);
            if (itemComp) {
                itemComp.setIndex(i);
                itemComp.setTag(label);
                
                itemComp.setLongPressCallback(this.onItemLongPress.bind(this));
            }
            // 添加到 Content 节点下
            this.contentNode.addChild(newItem);
        }
    }

    /**
     * 长按删除
     */
    private onItemLongPress(index: number) {
        console.log('【Panel收到长按】index=', index);

        if (!this.confirmDialogComp) {
            console.error('弹窗组件未初始化');
            return;
        }

        this.confirmDialogComp.open(
            '确定删除',
            '确定要删除这个标签吗？',
            () => {
                console.log('用户确认删除 index=', index);
                this.deleteTag(index);
            },
            () => {
                console.log('用户取消删除');
            }
        )
    }

    /**
     * 删除指定索引的标签
     */
    private deleteTag(index: number) {
        if(index < 0 || index >= this.tagList.length) {
            console.warn('删除失败：索引越界', index);
            return;
        }

        const removed = this.tagList.splice(index,1);
        console.log('【已删除】', removed[0]);
        console.log('【剩余数据】',this.tagList);

        this.refreshListView();
    }

    private addTagToData(tag:string){
        this.tagList.push(tag);
    }

    /**
     * 点击新建按钮，新建标签
     */
    onBtnCreatClick() {
        console.log('点击了新建按钮');

        // 显示新建弹窗
        this.creatPopup.active = true;
        // 用户点击确认时，获取输入框中的文本 => 需要先初始化输入框

    }

    onClickYes() {
        const tagLabel = this.editBox.string;
        console.log('【新建标签名称】', tagLabel);
        if(tagLabel) {
            this.addTagToData(tagLabel);
            this.refreshListView();
        } else {
            console.log('新建标签失败');
        }
        this.creatPopup.active = false;
    }

    onClickNo() {
        console.log('【用户取消新建】');
        this.creatPopup.active = false;
    }

}


