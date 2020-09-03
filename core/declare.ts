import zrender from 'zrender';
import { Node, Line, Pen } from './models/pen'
export enum Direction {
  None,
  Up,
  Right,
  Bottom,
  Left
}

export enum Lock {
  None,
  Readonly,
  NoEvent
}

export enum AnchorMode {
  Default,
  In,
  Out
}

export enum NodeType {
  Node,
  Line,
  ResizeCP
}

export enum ImageAlign{
  Center,
  Left,
  Top,
  Right,
  Bottom
}


export interface LineStyle {
  stroke?: string,
  lineDash?: number[],
  lineDashOffset?: number,
  lineWidth?: number,
  strokeNoScale?: boolean
}

export interface ShadowStyle{
  shadowBlur?: number,
  shadowColor?: string,
  shadowOffsetX?: number,
  shadowOffsetY?: number,
}

export interface TextStyle{
  font?: string,
  fontStyle?: string,
  fontWeight?: string | number,
  fontSize?: string,
  fontFamily?: string,
  textFill?: string,
  textStroke?: string,
  textWidth?: string,
  textHeight?: string,
}

// zrender event
export interface zMouseEvent{
  type: string;
  offsetX: number;
  offsetY: number;
  event: MouseEvent;
  target: any;
  topTarget: any;
  cancelBubblue: boolean;
  gestureEvent: any;
  pinchScale: any;
  pinchX: any;
  pinchY: any;
  which: number;
  wheelDelta: number;
  zrByTouch: any;
  stop: Function;
}

export const relatedZr2Node = (displayable:zrender.Displayable, node: Pen|Node|Line): void =>{
  displayable._node = node;
  node._zr.push(displayable);
}

export enum LogType {
  Normal,
  Warning,
  Error
}
export const log = function(from?:any, description?:any, type:LogType = LogType.Normal, splitSymbol=''){
  const css = [
    'padding: 2px 4px;background: #2779ff;color: white;border-radius: 2px;',
    'padding: 2px 4px;background: orange;color: white;border-radius: 2px;',
    'padding: 2px 4px;background: #ff696a;color: white;border-radius: 2px;'
  ]
  const textCss = 'color: blue';
  if(arguments.length===1){
    console.log('%s log from %c%s', splitSymbol,css[type],from)
    return
  }
  if(typeof description === 'object'){
    console.log('%s log from %c%s%c:%o', splitSymbol,css[type],from, textCss, description)
  }else{
    console.log('%s log from %c%s%c:%s', splitSymbol,css[type],from, textCss, description,)
  }
}