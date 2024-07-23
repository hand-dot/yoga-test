import Yoga, { PositionType, Edge } from 'yoga-layout';
import type { Node as YogaNode } from 'yoga-layout';

interface Element {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface LayoutResult {
  page: number;
  element: YogaNode;
}

class PDFLayout {
  private pageWidth: number;
  private pageHeight: number;
  private pages: YogaNode[];
  private currentY: number;

  constructor(pageWidth: number, pageHeight: number) {
    this.pageWidth = pageWidth;
    this.pageHeight = pageHeight;
    this.pages = [this.createNewPage()];
    this.currentY = 0;
  }

  private createNewPage(): YogaNode {
    const page = Yoga.Node.create();
    page.setWidth(this.pageWidth);
    page.setHeight(this.pageHeight);
    return page;
  }

  public addElement({ width, height, x, y }: Element): LayoutResult {
    if (y + height > this.pageHeight) {
      // ページブレイクが必要
      this.pages.push(this.createNewPage());
      this.currentY = 0;
      y = 0; // 新しいページの先頭に配置
    }

    const element = Yoga.Node.create();
    element.setPositionType(PositionType.Absolute);
    element.setPosition(Edge.Left, x);
    element.setPosition(Edge.Top, y);
    element.setWidth(width);
    element.setHeight(height);

    const currentPage = this.pages[this.pages.length - 1];
    currentPage.insertChild(element, currentPage.getChildCount());

    this.currentY = Math.max(this.currentY, y + height);

    return { page: this.pages.length - 1, element };
  }

  public calculateLayout(): void {
    this.pages.forEach(page => page.calculateLayout(undefined, undefined));
  }

  public printLayout(): void {
    this.pages.forEach((page, pageIndex) => {
      console.log(`Page ${pageIndex + 1}:`);
      for (let i = 0; i < page.getChildCount(); i++) {
        const child = page.getChild(i);
        console.log(`  Element ${i + 1}: Left: ${child.getComputedLeft()}, Top: ${child.getComputedTop()}, Width: ${child.getComputedWidth()}, Height: ${child.getComputedHeight()}`);
      }
    });
  }

  public renderToCanvas(canvasId: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    const scale = 0.5; // スケールを調整して全体を表示しやすくする
    canvas.width = this.pageWidth * scale;
    canvas.height = this.pageHeight * scale * this.pages.length;
  
    this.pages.forEach((page, pageIndex) => {
      // ページの背景を描画
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, pageIndex * this.pageHeight * scale, this.pageWidth * scale, this.pageHeight * scale);
      
      // ページの境界線を描画
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(0, pageIndex * this.pageHeight * scale, this.pageWidth * scale, this.pageHeight * scale);
  
      // 各要素を描画
      for (let i = 0; i < page.getChildCount(); i++) {
        const child = page.getChild(i);
        ctx.fillStyle = `hsl(${i * 60}, 70%, 80%)`;
        ctx.fillRect(
          child.getComputedLeft() * scale,
          (pageIndex * this.pageHeight + child.getComputedTop()) * scale,
          child.getComputedWidth() * scale,
          child.getComputedHeight() * scale
        );
        ctx.strokeRect(
          child.getComputedLeft() * scale,
          (pageIndex * this.pageHeight + child.getComputedTop()) * scale,
          child.getComputedWidth() * scale,
          child.getComputedHeight() * scale
        );
      }
    });
  }
}



export const runYoga = () => {
  // A4サイズを想定 (ポイント単位: 595 x 842)
  const layout = new PDFLayout(595, 842);

  // ページ1
  layout.addElement({ width: 100, height: 100, x: 50, y: 50 });  // 左上の小さな正方形
  layout.addElement({ width: 200, height: 150, x: 200, y: 100 }); // 中央の長方形
  layout.addElement({ width: 150, height: 200, x: 420, y: 50 });  // 右上の縦長の長方形
  layout.addElement({ width: 300, height: 100, x: 150, y: 300 }); // 中央下の横長の長方形
  layout.addElement({ width: 100, height: 300, x: 50, y: 500 });  // 左下の縦長の長方形

  // ページ2にまたがる要素
  layout.addElement({ width: 400, height: 400, x: 100, y: 600 }); // 大きな正方形、一部が次のページに

  // ページ2
  layout.addElement({ width: 250, height: 250, x: 50, y: 50 });  // 左上の中サイズの正方形
  layout.addElement({ width: 150, height: 150, x: 400, y: 100 }); // 右上の小さめの正方形

  // ページ3にまたがる要素
  layout.addElement({ width: 500, height: 300, x: 50, y: 700 }); // 大きな横長の長方形、一部が次のページに

  // ページ3
  layout.addElement({ width: 200, height: 200, x: 200, y: 200 }); // 中央の正方形
  layout.addElement({ width: 100, height: 400, x: 450, y: 50 });  // 右側の細長い縦長の長方形

  // 境界ケース
  layout.addElement({ width: 600, height: 100, x: 0, y: 50 });   // ページの幅を超える要素
  layout.addElement({ width: 100, height: 900, x: 50, y: 0 });   // ページの高さを超える要素
  layout.addElement({ width: 200, height: 200, x: 500, y: 750 }); // 一部がページ外にはみ出す要素

  layout.calculateLayout();
  layout.printLayout();

  // キャンバスにレンダリング
  layout.renderToCanvas('debugCanvas');
};