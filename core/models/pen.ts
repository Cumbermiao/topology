import { zrender, NodeType, Lock, ShadowStyle, TextStyle, ImageAlign, relatedZr2Node, log } from "../declare";
import Rect from "./rect";
import Point from "./point";
import Store, { s8 } from "../store";
import { textFns, defaultTextFn, anchorFns, defaultAnchorFn, 
  NodeFns, defaultNodeFn, defaultImageFn, defaultIconFn 
} from './drawFns';


export abstract class Pen {
  id?: string|number;
  type: NodeType;
  name: string;
  rect: Rect = new Rect(0,0,0,0);
  _visible: boolean;
  lock: Lock = Lock.None;
  _zr: any[] = []; // _zr[0] 为最外层的 Node
  z: number = 0;
  data: any;

  scale: number[] = [1, 1];
  get visible(){
    return this._visible
  }
  set visible(value:boolean){
    this._visible = value;
    value ? this.show() : this.hide();
  }

  get position(){
    if(this._zr.length) return this._zr[0].position
    return [0,0]
  }

  set position(arr:number[]){
    if(this._zr.length) this._zr[0].attr('position', arr)
  }

  constructor(json?:any) {
    if(json){
      const keys = ['id', 'type', 'name', 'rect', 'visible', 'z', 'data'];
      keys.forEach(key=>{
        if(key === 'rect' && json.rect){
          this.rect = new Rect(json.rect.x, json.rect.y, json.rect.width, json.rect.height);
        } else if(key ==='z'){
          this.z = json.z || 0;
        } else{
          this[key] = json?.[key];
        }
      });

      // valued keys
      if(json?.lock !== undefined) this.lock = json.lock;
    }
  }

  abstract clone(): Pen;
  abstract show(): void;
  abstract hide(): void;
  abstract dispose(): void;
  abstract render(renderer?:any): void;
  abstract update(): void;
  
}

export class Node extends Pen {
  // parent
  parentId: string;
  rectInParent: {
    x: number | string;
    y: number | string;
    width: number | string;
    height: number | string;
    margin: number[];
    rotate: number;
    rect?: Rect;
  }

  //style
  opacity: number;
  strokeStyle = '#333';
  fillStyle = '#fff';
  shadow: ShadowStyle;
  text: string;
  textStyle: TextStyle;
  lineDash: number[] = null;
  lineDashOffset: number = null;
  padding: number[];
  bgType: number; // 0 纯色； 1 线性渐变； 2 径向渐变；
  bgColor: any;
  
  hideInput: boolean;
  hideResizeCP: boolean;
  hideAnchor: boolean;

   // element rect info
   image: string;
   imageWidth: number;
   imageHeight: number;
   imageAlign: ImageAlign;
   imgEl: HTMLImageElement;
 
   icon: string; // unicode 编码
   iconSize: number;
   iconColor: string;
 
   textRect: Rect;
   fullTextRect: Rect;
   iconRect: Rect;
   fullIconRect: Rect;
   imgRect: Rect;
   anchors: Point[] = [];
   children: Node[] = [];

   //fn
   textFn: any;
   anchorFn: any;
   nodeFn: any;
   imgFn: any;
   iconFn: any;

  constructor(json?:any) {
    super(json);
    this.type = NodeType.Node;

    if(json === undefined){
      this.id = s8();
      return;
    }

    const keys = ['parentId', 'text', 'hideInput', 'hideResizeCP', 'hideAnchor', 'image'];
    keys.forEach(key=>{
      this[key] = json?.[key];
    });

    const valuedKeys = ['shadow','textStyle','strokeStyle','fillStyle','lineDash','lineDashOffset','rectInParent',
    'padding','imageWidth','imageHeight','imageAlign','imgEl', 'children', 'position', 'scale'];
    valuedKeys.forEach(key =>{
      //TODO: 对于指针引用类型是否需要深拷贝
      if(key === 'children' && json?.children?.length ){
        this.children = json.children.map(item=>new Node(item));
      }else{
        json?.[key] && (this[key]=json[key]);
      }
    });

    this.initDrawFns();
  }

  initDrawFns(){
    this.textFn = textFns[name] || defaultTextFn;
    this.anchorFn = anchorFns[name] || defaultAnchorFn;
    this.nodeFn = NodeFns[name] || defaultNodeFn;
    this.imgFn = defaultImageFn;
    this.iconFn = defaultIconFn;
  }

  initRectInfos(){
    // 使用 drawFn 初始化 rect 信息
    
    // TODO: this 是否必要
    if(this.text) this.textFn(this);
    if(this.anchors.length) this.anchorFn(this);
    if(this.image) this.imgFn(this);
    if(this.icon) this.iconFn(this);
  }

  recalcRectInfos(){

    //CONTINUE: if rect info change , rerender all _zr element
    // if(this._zr.length){
    //   const position = this._zr[0].position;
    //   if(position.some(num=>num!==0)){
    //     this.rect = new Rect(this.rect.x + position[0], this.rect.y + position[1], this.rect.width, this.rect.height);
    //     this._zr[0].attr({
    //       position : [0,0],
    //       shape: {
    //         x: this.rect.x,
    //         y: this.rect.y,
    //         width: this.rect.width,
    //         height: this.rect.height
    //       }
    //     })
    //   }
      
    //   log('recalcRectInfos', position);
    // }
  }

  clone(){ 
    return new Node(this);
  }

  show(){
    this._zr?.length && this._zr.forEach(item=>item.show())
  }

  hide(){
    this._zr?.length && this._zr.forEach(item=>item.hide())
  }

  resize({x=this.rect.x,y=this.rect.y,width=this.rect.width,height=this.rect.height}){
    this.rect = new Rect(x,y,width,height)
    this.initRectInfos()
    let textRect = {}
    if(this.textRect) textRect = {
      x: this.textRect.x,
      y: this.textRect.y,
      width: this.textRect.width,
      height: this.textRect.height
    }
    this._zr[0].attr({
      shape: {
        x,
        y,
        width,
        height
        
      },
      style: {
        textRect: textRect
      }
    })
    // log('Node.resize');
  }

  translate(){
    // log('Pen.translate')
    const renderer:any =  Store.get('topology-renderer');
    
  }

  dispose(renderer?:any){
    // 清空图形
    renderer = renderer || Store.get('topology-renderer')
    this._zr.map(item=>{
      renderer.remove(item)
    })
    this._zr = []
  }

  render(renderer){
    // TODO: render 函数拆分
    this.initRectInfos();
    // log('Node.render', this);
    const style = {
      fill: this.fillStyle,
      stroke: this.strokeStyle,
      lineDash: this.lineDash,
      lineDashOffset: this.lineDashOffset,
      ...this.textStyle
    }

    if(this.text){
      (style as any).text = this.text;
      (style as any).textRect = {
        x: this.textRect.x,
        y: this.textRect.y,
        width: this.textRect.width,
        height: this.textRect.height
      };
    };

    const rect = new zrender.Rect({
      shape: {
        x: this.rect.x,
        y: this.rect.y,
        width: this.rect.width,
        height: this.rect.height
      },
      style,
      draggable: this.lock === Lock.None,
      z: this.z
    });
    log('Node.render', rect)
    relatedZr2Node(rect, this);
    renderer.add(rect)
    this._zr.push(rect)
  }

  update(){}

}

export class Line extends Pen {

  from: Point;
  to: Point;
  controlPoints: Point[] = [];
  arrowType: string[] = ['','triangleSolid'];
  arrowSize: number[] = [];

  lineWidth = 2;
  lineColor = 'blue';
  lineStyle = 'solid';

  constructor(json?:any) {
    super(json);

    if(json?.from){
      const {x,y,direction,anchorIndex,id} = json.from
      this.from = new Point(x,y,direction,anchorIndex,id)
    }
    if(json?.to){
      const {x,y,direction,anchorIndex,id} = json.to
      this.to = new Point(x,y,direction,anchorIndex,id)
    }

    if(json){
      const {arrowType, arrowSize, lineWidth, lineColor, lineStyle} = json
      arrowType && (this.arrowType = arrowType);
      arrowSize && (this.arrowSize = arrowSize);
      lineWidth!==undefined && (this.lineWidth = lineWidth);
      lineColor && (this.lineColor = lineColor);
      lineStyle && (this.lineStyle = lineStyle);
    }
  }

  clone(){ return new Line(this)};
  show(){};
  hide(){};
  dispose(){};
  render(renderer?:any){
    renderer = renderer || Store.get('topology-renderer');
    const line = new zrender.Line({
      shape: {
        x1: this.from.x,
        y1: this.from.y,
        x2: this.to.x,
        y2: this.to.y
      },
      style: {
        fill: this.lineColor,
        lineWidth: this.lineWidth,
        lineDash: this.lineStyle === 'solid' ? null : [4,4]
      }
    });
    relatedZr2Node(line, this);
    renderer.add(line);
    this._zr.push(line)
  };
  update(){}

}