import { ShadowStyle, TextStyle, Lock, NodeType, ImageAlign, Direction, relatedZr2Node } from '../declare';
import Store, { s8 } from '../store'
import Rect from './rect';
import Point from './point';
import zrender from 'zrender';

const anchorFns:{[key:string]: Function} = {};
const textFns:{[key:string]: Function} = {};
const NodeFns:{[key:string]: Function} = {};

// 只生成Node 中每个元素的 rect 等信息
const defaultAnchorFn = (node:Node)=>{
  const { x, y, width, height } = node.rect;
  const pos = [[x+width/2, y], [x+width, y+height/2], [x+width/2, y+height], [x, y+height/2]];
  const direction = [Direction.Up, Direction.Right, Direction.Bottom, Direction.Left];
  pos.forEach(([xAxis, yAxis], idx)=>{
    node.anchors.push(new Point(xAxis, yAxis, direction[idx]))
  })
};
const defaultTextFn = (node:Node)=> {
  const { x, y, width, height } = node.rect
  node.textRect = new Rect(
    x,
    y + height,
    width,
    40
  )
};
const defaultNodeFn: (node:Node)=>void = (node:Node)=> {

};
const defaultIconFn: (node:Node)=>void  = (node:Node)=> { // unicode 图标
  const { x, y, width, height } = node.rect
  node.iconRect = new Rect(
    x,
    y + height,
    width,
    40
  )
};

const defaultImageFn: (node:Node)=>void  = (node:Node)=> {
  if(node.image){
    const { image, imageWidth, imageHeight, imageAlign,  imgRect, rect} = node
    getImageRect(image).then(res=>{
      // imgRect.width = imageWidth || res.width;
      // imgRect.height = imageHeight || res.height;
      // UNDONE:
      imgRect.x = rect.x + (rect.width - imgRect.width)/2;
      imgRect.y = rect.y + (rect.height - imgRect.height)/2;
    }).catch(err=>{})
  }
}

const getImageRect = image => {
  return new Promise((resolve,reject)=>{
    const el = document.createElement('img');
    el.onload = e=> {
      console.dir(e)
      resolve(e)
    }
    el.onerror = err=> reject(err)
    el.src = image
  })
  
}

export class Element {

  type: NodeType;

  constructor() {
    
  }
}

// 节点： 模型、基础图形、文字
export class Node extends Element {
  id: string;
  parentId: string;
  name: string;
  visible: boolean;
  // style
  z: number;
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
  
  lock: Lock;
  hideInput: boolean;
  hideResizeCP: boolean;
  hideAnchor: boolean;

  rectInParent: {
    x: number | string;
    y: number | string;
    width: number | string;
    height: number | string;
    margin: number[];
    rotate: number;
    rect?: Rect;
  }

  data: any;
  value: number;

  // element rect info
  rect: Rect = new Rect(0,0,0,0);

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
  _zr: zrender.Displayable[] = [];


  constructor(json?:any) {
    super();
    this.type = NodeType.Node;

    if(json===undefined){
      this.id = s8();
      return;
    }

    const {
      id = s8(), 
      parentId='', 
      name = '',
      rect,
      z,
      strokeStyle = '',
      fillStyle = '#fff',
      shadow,
      text = '',
      textStyle,
      lineDash,
      lineDashOffset,
      lock = Lock.None,
      hideInput = false,
      hideResizeCP = false,
      hideAnchor = false,
      rectInParent,
      padding,
      visible = true,
      data,
      value,
      image='',
      imageWidth,
      imageHeight,
      imageAlign,
      imgEl,
      children
    } = json

    this.id = id;
    this.parentId = parentId;
    this.name = name;
    this.rect = new Rect(rect.x,rect.y,rect.width,rect.height);
    this.text = text;
    this.lock = lock;
    this.hideInput = hideInput;
    this.hideResizeCP = hideResizeCP;
    this.hideAnchor = hideAnchor;
    this.visible = visible;
    this.data = data;
    this.value = value;
    this.image = image;

    z!==undefined && (this.z = z);
    shadow && (this.shadow = shadow);
    textStyle && (this.textStyle = textStyle);
    strokeStyle && (this.strokeStyle = strokeStyle);
    fillStyle && (this.fillStyle = fillStyle);
    lineDash && (this.lineDash = lineDash);
    lineDashOffset && (this.lineDashOffset = lineDashOffset);
    rectInParent && (this.rectInParent = rectInParent);
    padding && (this.padding = padding);
    imageWidth && (this.imageWidth = imageWidth);
    imageHeight && (this.imageHeight = imageHeight);
    imageAlign && (this.imageAlign = imageAlign);
    imgEl && (this.imgEl = imgEl);

    if(children && Array.isArray(children)){
      this.children = children.map(item=>new Node(item))
    }

    this.init()
  }

  init(){
    const textFn = textFns[name] || defaultTextFn
    const anchorFn = anchorFns[name] || defaultAnchorFn
    const nodeFn = NodeFns[name] || defaultNodeFn
    const imgFn = defaultImageFn
    const iconFn = defaultIconFn
    textFn(this)
    anchorFn(this)
    nodeFn(this)
    if(this.image) imgFn(this)
    if(this.icon) iconFn(this)
  }

  render(renderer){
    // render text node img icon
    const style = {
      fill: this.fillStyle,
      stroke: this.strokeStyle,
      lineDash: this.lineDash,
      lineDashOffset: this.lineDashOffset,
      ...this.textStyle
    }
    const shape = {}
    if(this.text){
      (style as any).text = this.text;
      (style as any).textRect = {
        x: this.textRect.x,
        y: this.textRect.y,
        width: this.textRect.width,
        height: this.textRect.height
      };
    }
    const rect = new zrender.Rect({
      shape: {
        x: this.rect.x,
        y: this.rect.y,
        width: this.rect.width,
        height: this.rect.height
      },
      style,
      draggable: this.lock === Lock.None
    });
    relatedZr2Node(rect, this);
    renderer.add(rect)
  }

  dispose(renderer?:any){
    // 清空图形
    renderer = renderer || Store.get('topology-renderer')
    this._zr.map(item=>{
      renderer.remove(item)
    })
    this._zr = []
  }

  hide(){
    console.log('-------hide')
    this._zr.forEach(item=>item.hide())
  }

  translate(){}

  resize({x=this.rect.x,y=this.rect.y,width=this.rect.width,height=this.rect.height}){
    this.rect = new Rect(x,y,width,height)
    this.init()
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
    console.log('resize node', textRect)
  }

  hit(){

  }
  clone(){
    return new Node(this)
  }
}

// 连接线
export class Line{
  from: Point;
  to: Point;
  controlPoints: Point[] = [];
  arrowType: string[] = ['','triangleSolid'];
  arrowSize: number[] = [];

  lineWidth = 2;
  lineColor = 'blue';
  lineStyle = 'solid';
  _zr: zrender.Displayable[] = [];
  id;

  constructor(json?:any) {

    if(json?.from){
      const {x,y,direction,anchorIndex,id} = json.from
      this.from = new Point(x,y,direction,anchorIndex,id)
    }
    if(json?.to){
      const {x,y,direction,anchorIndex,id} = json.to
      this.to = new Point(x,y,direction,anchorIndex,id)
    }
    if(json?.id) this.id = json.id;

    if(json){
      const {arrowType, arrowSize, lineWidth, lineColor, lineStyle} = json
      arrowType && (this.arrowType = arrowType);
      arrowSize && (this.arrowSize = arrowSize);
      lineWidth!==undefined && (this.lineWidth = lineWidth);
      lineColor && (this.lineColor = lineColor);
      lineStyle && (this.lineStyle = lineStyle);
    }
  }

  render(renderer){
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
    })
    relatedZr2Node(line, this);
    renderer.add(line)
  }
}