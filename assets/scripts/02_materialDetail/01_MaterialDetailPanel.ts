import { _decorator, Component, Node, PageView, instantiate, Prefab } from 'cc';
import { AllData, STORAGE_KEY, createDefaultData } from '../00_common/02_DataTypes';
import { StorageManager } from '../00_common/03_StorageManager';
import { MaterialData } from '../00_common/02_DataTypes';
import { MaterialDetailPage } from './02_MaterialDetailPage'; 
import { TagEditPanel } from '../03_tagEdit/01_TagEditPanel';
const { ccclass, property } = _decorator;

@ccclass('MaterialDetailPanel')
export class MaterialDetailPanel extends Component {
    @property(Node)
    pageMaterialDetail: Node = null;            // 素材详情页根节点

    @property(PageView)
    pageViewContent: PageView = null;           // pageview容器

    @property(Prefab)
    materialDetailPagePrefab: Prefab = null;    // 详情页预制体

    @property(TagEditPanel)
    TagEditPanel: TagEditPanel = null;

    private materialList: MaterialData[] = [];
    private pageIndex: number = 0;


    public closeMaterialDetailPage() {
        this.pageMaterialDetail.active = false;
    }

    onEnable() {
        const allData: AllData = StorageManager.inst.getObj(STORAGE_KEY,createDefaultData());
        this.materialList = allData.materialList || [];
        this.refreshView();
    }

    private setIndex(index:number) {
        this.pageIndex = index;
    }

    private refreshView() {
        this.pageViewContent.removeAllPages();

        for (let i=0; i<this.materialList.length;i++) {
            const material = this.materialList[i];

            // 获取脚本组件，并设置数据
            const newPage = instantiate(this.materialDetailPagePrefab);
            const pageComp = newPage.getComponent(MaterialDetailPage);
            if (pageComp) {
                pageComp.setData(material);
                pageComp.setTagEditPanelNode(this.TagEditPanel);
            }
            this.pageViewContent.addPage(newPage);
        }

        // 建页之后，等一帧再跳转
        this.scheduleOnce(() => {
            this.pageViewContent.scrollToPage(this.pageIndex,0);
        },0);
    }
}


