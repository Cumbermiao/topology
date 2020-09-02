import zrender from 'zrender';
import { Node,Line } from './models/node'
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
}

export const relatedZr2Node = (displayable:zrender.Displayable, node: Node|Line): void =>{
  displayable._node = node;
  node._zr.push(displayable);
}