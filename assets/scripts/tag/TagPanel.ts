/**
 * TagPanel: 标签管理面板
 * 职责：
 * 1、点击新建标签（弹窗输入 → 校验 → 入列表）
 * 2、滚动展示标签列表
 * 3、长按标签 → 确认删除
 */

import { _decorator, Component, Node, find, Prefab, Content, Button, EditBox, instantiate, Label } from 'cc';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StorageManager } from '../common/StorageManager';
import { TagItem } from './TagItem'; 
import { AllData, STORAGE_KEY, createDefaultData } from '../common/DataTypes';
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
    private tagList: TagData[] = [];                     // 标签数据
    private confirmDialogNode: Node = null;             // 弹窗节点（缓存复用）
    private confirmDialogComp: ConfirmDialog = null;    // 弹窗脚本组件




    // =============================生命周期============================
    onLoad() {
        const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
        this.tagList = allData.tagList || [];
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
            const tag = this.tagList[i];
            const label = tag.name;
            console.log("开始加载",label);
            

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


    // ============================新建标签弹窗=============================
    /** 收拢弹窗操作，封装统一开关方法 */
    /** 打开新建弹窗，自动重置输入状态 */
    private openCreatePopup() {
        this.createPopup.active = true;
        this.lblWarn.string = '';
        this.editBox.string = ''; 
    }

    /** 关闭新建弹窗，自动清空输入 */
    private closeCreatePopup() {
        this.lblWarn.string = '';
        this.editBox.string = '';
        this.createPopup.active = false;
    }



    /** 抽离独立校验方法，逻辑完全解耦 */
    /** 把标签名校验单独拎出来，后需要加新规则（比如标签长度限制、特殊字符拦截）时，可以直接往这个方法里加 */
    /** 点击新建按钮 */
    private validateTagName(name: string): string | null {
        if (!name) {
            return '新建标签失败，标签名称不可为空！';
        }
        if (this.tagList.includes(name)) {
            return '新建标签失败，该标签已存在！';
        }
        // 后续新增校验规则直接在这里加，比如长度限制、特殊字符拦截
        return null;
    }




    /** 简化按钮回调，只做流程串联 */
    /** 点击新建按钮 */
    onBtnCreateClick() {
        this.openCreatePopup();
    }

    /** 弹窗确认 */
    onClickYes() {
        const tagLabel = this.editBox.string.trim();    // .trim()拦截全是空格的无效输入
        const errMsg = this.validateTagName(tagLabel);
        if (errMsg) {
            this.lblWarn.string = errMsg;
            return;
        }
        this.addTagToData(tagLabel);
        this.refreshListView();
        this.closeCreatePopup();  
    }


    /** 弹窗取消 */
    onClickNo() {
        this.closeCreatePopup();
    }


    // ======================工具方法========================
    /** 添加标签到数据列表 */
    private addTagToData(tagName:string){ 
        const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
        const newTag: TagData = {
            id: allData.nextIds.tag,
            name: tagName
        };
        allData.nextIds.tag += 1;
        allData.tagList.push(newTag);

        StorageManager.inst.setObj(STORAGE_KEY,allData);

        this.tagList.push(newTag);
    }

}


