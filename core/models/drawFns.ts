import { Direction } from "../declare";

import { Node, Pen } from './pen';

import Point from "./point";

import Rect from "./rect";

export const anchorFns:{[key:string]: Function} = {};
export const textFns:{[key:string]: Function} = {};
export const NodeFns:{[key:string]: Function} = {};

// TODO: position & scale 如何区分先后操作
export const getNodeRect = (node:Pen) => {
  const [offsetX, offsetY] = node.position;
  const rect:Rect = node.rect;
  return {
    x: rect.x + offsetX,
    y: rect.y + offsetY,
    width: rect.width,
    height: rect.height
  }
}

// 只生成Node 中每个元素的 rect 等信息
export const defaultAnchorFn = (node:Node)=>{
  const { x, y, width, height } = getNodeRect(node);
  const pos = [[x+width/2, y], [x+width, y+height/2], [x+width/2, y+height], [x, y+height/2]];
  const direction = [Direction.Up, Direction.Right, Direction.Bottom, Direction.Left];
  pos.forEach(([xAxis, yAxis], idx)=>{
    node.anchors.push(new Point(xAxis, yAxis, direction[idx]))
  })
};
export const defaultTextFn = (node:Node)=> {
  // NOTE: textRect 相对于 _zr[0].rect
  const { x, y, width, height } = node.rect;
  node.textRect = new Rect(
    x,
    y + height,
    width,
    40
  );
};
export const defaultNodeFn: (node:Node)=>void = (node:Node)=> {
  return getNodeRect(node)
};
export const defaultIconFn: (node:Node)=>void  = (node:Node)=> { // unicode 图标
  const { x, y, width, height } = getNodeRect(node)
  node.iconRect = new Rect(
    x,
    y + height,
    width,
    40
  )
};

export const defaultImageFn: (node:Node)=>void  = (node:Node)=> {
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

export const getImageRect = image => {
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