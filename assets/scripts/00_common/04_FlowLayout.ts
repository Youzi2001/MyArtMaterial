import { _decorator, Component, Node, UITransform, Layout } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('FlowLayout')
@executeInEditMode(true)
export class FlowLayout extends Component {
    @property
    spacingX: number = 10;

    @property
    spacingY: number = 10;

    @property
    paddingLeft: number = 0;

    @property
    paddingRight: number = 0;

    @property
    paddingTop: number = 0;

    @property
    paddingBottom: number = 0;

    @property
    alignHorizontal: boolean = true;    // 每行是否水平居中

    @property
    alignVertical: boolean = true;      // 整体是否竖直居中

    @property
    autoResizeHeight: boolean = true;   // 是否自动调整自身高度

    /** 重新布局 */
    public updateLayout() {
        const containerUI = this.node.getComponent(UITransform);
        if (!containerUI) return;

        const children = this.node.children.filter(c => c.active);
        if (children.length === 0) {
            if (this.autoResizeHeight) {
                containerUI.setContentSize(containerUI.width, this.paddingTop + this.paddingBottom);
            }
            return;
        }

        const containerWidth = containerUI.width;
        const maxRowWidth = containerWidth - this.paddingLeft - this.paddingRight;

        // 1.计算每个子节点的宽度
        const items: { node: Node; width: number; height: number }[] = [];
        for (const child of children) {
            const ui = child.getComponent(UITransform);
            if (!ui) continue;
            items.push({ node: child, width: ui.width, height: ui.height });
        }

        // 2.分行
        const rows: { items: typeof items; width: number; height: number }[] = [];
        let currentRow: typeof items = [];
        let currentRowWidth = 0;
        let currentRowHeight = 0;

        for (const item of items) {
            const needWidth = currentRow.length === 0
                ? item.width
                : currentRowWidth + this.spacingX + item.width;
            
            if (needWidth > maxRowWidth && currentRow.length > 0) {
                // 换行
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
            rows.push({ items: currentRow, width: currentRowWidth, height: currentRowHeight});
        }

        // 3.计算总高度
        let totalHeight = this.paddingTop + this.paddingBottom;
        for (let i = 0; i < rows.length; i ++) {
            totalHeight += rows[i].height;
            if (i < rows.length - 1) totalHeight += this.spacingY;
        }

        // 4.设置容器高度
        if (this.autoResizeHeight) {
            containerUI.setContentSize(containerWidth, totalHeight);
        }

        // 5.摆放子节点
        const containerAnchorY = containerUI.anchorY;
        // 容器顶部y坐标（相对容器锚点）
        const topY = containerUI.height * (1 - containerAnchorY);

        let cursorY = topY - this.paddingTop;

        for (const row of rows) {
            // 这一行的顶部y
            const rowTopY = cursorY;
            // 这一行的中心y
            const rowCenterY = rowTopY - row.height / 2;

            // 计算这一行的起始x
            let startX: number;
            if (this.alignHorizontal) {
                // 水平居中
                const rowContentWidth = row.width;
                const leftSpace = (containerWidth - rowContentWidth) / 2;
                startX = -containerUI.width * containerUI.anchorX + leftSpace;
            } else {
                // 左对齐
                startX = -containerUI.width * containerUI.anchorX + this.paddingLeft;
            }

            let cursorX = startX;
            for (const item of row.items) {
                const ui = item.node.getComponent(UITransform);
                // 子节点锚点假设为（0.5，0.5），位置是中心点
                const itemCenterX = cursorX + item.width / 2;
                const itemCenterY = rowCenterY;

                item.node.setPosition(itemCenterX, itemCenterY, 0);

                cursorX += item.width + this.spacingX;
            }

            cursorY = rowTopY - row.height - this.spacingY;
        }
    }
}


