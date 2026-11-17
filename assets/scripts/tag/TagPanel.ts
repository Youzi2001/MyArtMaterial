/**
 * TagPanel: 标签管理面板
 * 职责：
 * 1、点击新建标签（弹窗输入 → 校验 → 入列表）
 * 2、滚动展示标签列表
 * 3、长按标签 → 确认删除
 */

import { _decorator, Component, Node, find, Prefab, Content, Button, EditBox, instantiate, Label } from 'cc';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TagItem } from './TagItem'; 
const { ccclass, property } = _decorator;

@ccclass('TagPanel')
export class TagPanel extends Component {

    // ===========================编辑器绑定============================
    @property(Prefab)
    prefabTagItem: Prefab = null;       // 标签项预制体

    @property(Prefab)
    prefabConfirmDialog: Prefab = null; // 确认弹窗项预制体

    @property(Node)
    contentNode: Node = null;           // 滚动列表容器

    @property(Node)
    createPopup: Node = null;           // 新建标签弹窗根节点

    @property(Button)
    btnCreate: Button = null;           // 新建按钮

    @property(Button)
    btnYes: Button = null;              // 弹窗确认按钮

    @property(Button)
    btnNo: Button = null;               // 弹窗取消按钮

    @property(EditBox)
    editBox: EditBox = null;            // 标签名称输入框

    @property(Label)
    lblWarn: Label = null;              // 错误提示文本



    // =============================内部数据==============================
    private tagList: string[] = [];                     // 标签数据
    private confirmDialogNode: Node = null;             // 弹窗节点（缓存复用）
    private confirmDialogComp: ConfirmDialog = null;    // 弹窗脚本组件




    // =============================生命周期============================
    onLoad() {
        this.createPopup.active = false;
        
        // 预先实例化弹窗
        if (this.prefabConfirmDialog) {
            this.confirmDialogNode = instantiate(this.prefabConfirmDialog);
            this.confirmDialogComp = this.confirmDialogNode.getComponent(ConfirmDialog);

            const canvas = find('Canvas');
            if (!canvas) {
                console.error('找不到 Canvas 节点，弹窗挂载失败');
                return;
            }
            this.confirmDialogNode.parent = canvas;
        }

        this.refreshListView();
    }


    // ====================列表刷新=====================
    /** 书信列表（清空重绘） */
    private refreshListView() {
        // 清空当前列表显示
        this.contentNode.removeAllChildren();

        // 遍历数据列表，创建对应的item
        for (let i = 0; i < this.tagList.length; i++) {
            const label = this.tagList[i];

            // 实例化预制体
            const newItem = instantiate(this.prefabTagItem);

            // 获取item上的脚本组件并设置数据
            const itemComp = newItem.getComponent(TagItem);
            if (itemComp) {
                itemComp.setIndex(i);
                itemComp.setTag(label);
                itemComp.setLongPressCallback(this.onItemLongPress.bind(this));
            }
            // 添加到 Content 节点下
            newItem.parent = this.contentNode;
        }
    }

   
    
    // =====================长按删除======================
    /** 标签长按回调 */
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

    /** 删除指定索引的标签 */
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


    // ============================新建标签=============================
    /** 点击新建按钮 */
    onBtnCreateClick() {
        console.log('新建标签');
        this.createPopup.active = true;
        this.lblWarn.string = '';
        this.editBox.string = ''; 
    }

    /** 弹窗确认 */
    onClickYes() {
        const tagLabel = this.editBox.string.trim();    // .trim()拦截全是空格的无效输入
        if (!tagLabel) {
            this.lblWarn.string = '新建标签失败，标签名称不可为空！';
            return;
        }


        if(this.tagList.includes(tagLabel)) {
            this.lblWarn.string = '新建标签失败，该标签已存在！';
            return;
        } 
        
        this.addTagToData(tagLabel);
        this.refreshListView();
        this.editBox.string = '';
        this.createPopup.active = false;
        
    }

    /** 弹窗取消 */
    onClickNo() {
        this.createPopup.active = false;
    }


    // ======================工具方法========================
    /** 添加标签到数据列表 */
    private addTagToData(tag:string){
        this.tagList.push(tag);
    }

}


