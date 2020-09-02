import Rect from "./rect";
import zrender from 'zrender';
import {NodeType} from '../declare'

export default class ResizeCP {
  width: number = 10;
  height: number = 10;
  rect: Rect;
  _zr: any;
  type = NodeType.ResizeCP;
  get x(){
    return this._x
  }
  set x(value){
    if(this._zr){
      this._zr.attr({
        shape:{x: value}
      })
    }
  }
  get y(){
    return this._y
  }
  set y(value){
    if(this._zr){
      this._zr.attr({
        shape:{ y: value }
      })
    }
  }
  constructor(public _x:number, public _y:number, public cursor:string) {
    this.rect = new Rect(_x,_y,this.width,this.height);
  }

  render(renderer){
    this._zr = new zrender.Rect({
      shape: {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      },
      style: {
        fill: '#fff',
        stroke: 'blue',
        lineWidth: 0.5
      },
      cursor: this.cursor,
      draggable: true,
      z: 100
    })
    this._zr._node = this;
    renderer.add(this._zr)
  }

  
}