import { _decorator, Component, Node, UITransform, Layout } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('FlowLayout')
@executeInEditMode(true)
export class FlowLayout extends Component {
    @property({ tooltip: '子节点水平间距' })
    spacingX: number = 10;

    @property({ tooltip: '行与行之间的垂直间距' })
    spacingY: number = 10;

    @property paddingLeft: number = 0;
    @property paddingRight: number = 0;
    @property paddingTop: number = 0;
    @property paddingBottom: number = 0;

    @property({ tooltip: '每行是否水平居中' })
    alignHorizontal: boolean = false;

    @property({ tooltip: '是否让容器高度自适应内容' })
    autoResizeHeight: boolean = true;

    /** 重入锁，防止排版过程中被再次触发 */
    private _isLayouting: boolean = false;
    private _lastHeight: number = 0;

    /**
     * 重新布局（只由外部主动调用）
     * @returns 排版后的内容总高度
     */
    public updateLayout(): number {
        const containerUI = this.node.getComponent(UITransform);
        if (!containerUI) return 0;

        if (this._isLayouting) return this._lastHeight;
        this._isLayouting = true;

        try {
            const containerWidth = containerUI.width;
            const maxRowWidth = containerWidth - this.paddingLeft - this.paddingRight;

            // 先让所有子节点自己把尺寸定稿（防止内部 Layout 还没算完）
            this.prepareChildren();

            const children = this.node.children.filter(c => c.active);
            if (children.length === 0) {
                const emptyH = this.paddingTop + this.paddingBottom;
                if (this.autoResizeHeight) {
                    containerUI.setContentSize(containerWidth, emptyH);
                }
                this._lastHeight = emptyH;
                return emptyH;
            }

            // 1. 收集子节点尺寸（此时已是最终值）
            const items: { node: Node; width: number; height: number }[] = [];
            for (const child of children) {
                const ui = child.getComponent(UITransform);
                if (!ui) continue;
                items.push({ node: child, width: ui.width, height: ui.height });
            }

            // 2. 分行
            const rows: { items: typeof items; width: number; height: number }[] = [];
            let currentRow: typeof items = [];
            let currentRowWidth = 0;
            let currentRowHeight = 0;

            for (const item of items) {
                const needWidth = currentRow.length === 0
                    ? item.width
                    : currentRowWidth + this.spacingX + item.width;

                if (needWidth > maxRowWidth && currentRow.length > 0) {
                    rows.push({ items: currentRow, width: currentRowWidth, height: currentRowHeight });
                    currentRow = [item];
                    currentRowWidth = item.width;
                    currentRowHeight = item.height;
                } else {
                    currentRow.push(item);
                    currentRowWidth = needWidth;
                    currentRowHeight = Math.max(currentRowHeight, item.height);
                }
            }
            if (currentRow.length > 0) {
                rows.push({ items: currentRow, width: currentRowWidth, height: currentRowHeight });
            }

            // 3. 计算内容总高
            let totalHeight = this.paddingTop + this.paddingBottom;
            for (let i = 0; i < rows.length; i++) {
                totalHeight += rows[i].height;
                if (i < rows.length - 1) totalHeight += this.spacingY;
            }

            // 4. 以容器“当前高度”确定顶部起点（锚点无关）
            const oldHeight = containerUI.height;
            const leftBound = -containerWidth * containerUI.anchorX;
            const topBound = oldHeight * (1 - containerUI.anchorY);

            let cursorY = topBound - this.paddingTop;

            // 5. 摆放子节点
            for (const row of rows) {
                const rowTopY = cursorY;
                const rowCenterY = rowTopY - row.height / 2;

                let cursorX: number;
                if (this.alignHorizontal) {
                    cursorX = leftBound + (containerWidth - row.width) / 2;
                } else {
                    cursorX = leftBound + this.paddingLeft;
                }

                for (const item of row.items) {
                    const ui = item.node.getComponent(UITransform)!;
                    // 锚点无关：cursorX 是左边缘，按子节点自身锚点换算成 position
                    const itemPosX = cursorX + item.width * ui.anchorX;
                    const itemPosY = rowCenterY + item.height * (ui.anchorY - 0.5);

                    item.node.setPosition(itemPosX, itemPosY, 0);

                    cursorX += item.width + this.spacingX;
                }

                cursorY = rowTopY - row.height - this.spacingY;
            }

            // 6. 摆完后再改容器高度（只改一次）
            if (this.autoResizeHeight) {
                containerUI.setContentSize(containerWidth, totalHeight);
            }

            this._lastHeight = totalHeight;
            return totalHeight;
        } finally {
            this._isLayouting = false;
        }
    }

    /** 让子节点的内部官方 Layout 立刻算完尺寸并禁用，避免帧末重排 */
    private prepareChildren(): void {
        for (const child of this.node.children) {
            const layouts = child.getComponentsInChildren(Layout) || [];
            if (!Array.isArray(layouts)) continue;
            for (const l of layouts) {
                if (!l.enabled) continue;
                l.updateLayout();
                l.enabled = false;
            }
        }
    }
}