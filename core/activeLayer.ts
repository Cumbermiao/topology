import Store from './store'
import Rect from './models/rect'
import { Topology } from './topology'
import ResizeCP from './models/resizeCP'
import { Node } from './models/node';

const resizeCursors = ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'];

export default class ActiveLayer {
  protected data;
  protected renderer;
  nodeBackup;
  resizeCP: ResizeCP[]=[];
  raf = null;

  constructor() {
    // this.data = Store.get('topology-data');
    this.renderer = Store.get('topology-renderer');
    
    Store.subscribe('active-node',(nodes)=>{
      console.log('activeNode', nodes)
      if(!nodes) {
        this.data = null;
        this.nodeBackup = null;
        this.hideResizeCP();
        return;
      }

      this.data = nodes;
      this.data.hide();
      this.nodeBackup = new Node(nodes);
      this.nodeBackup.render(this.renderer);
      this.render();
    })

  }

  locked(){
    return this.data.lock;
  }

  getRect(){
    if(this.nodeBackup){
      return this.nodeBackup.rect
    }
  }

  renderResizeCPs(exludeIdx?:number){
    const rect: Rect = this.getRect()
    const points = [
      [rect.x - 5, rect.y-5],
      [rect.x-5 + rect.width, rect.y-5], 
      [rect.x-5 + rect.width, rect.y-5 + rect.height], 
      [rect.x-5, rect.y-5 + rect.height]];
    if(!this.resizeCP.length){
      this.resizeCP = points.map(([x,y],i)=>new ResizeCP(x,y,resizeCursors[i]));
      this.resizeCP.forEach(item=>item.render(this.renderer));
    }else{
      this.resizeCP.forEach((item, idx)=>{
        if(idx !== exludeIdx){
          item.x = points[idx][0]
          item.y = points[idx][1]
        }
        // show CP if CP has been hidden
        item._zr.show()
      })
    }
  }

  hideResizeCP(){
    if(this.resizeCP){
      this.resizeCP.forEach(item=>item._zr.hide())
    }
  }

  /**
   * 
   * @param resizeCP 
   * @param done boolean 是否 resize 结束
   */
  resizeRect(resizeCP:ResizeCP, done?:boolean){
    const idx = resizeCursors.indexOf(resizeCP.cursor);
    const zr = resizeCP._zr;
    const position = zr.position;
    let x = this.data.rect.x;
    let y = this.data.rect.y;
    let width = this.data.rect.width;
    let height = this.data.rect.height;
    switch (idx){
      case 0:
        x += position[0]
        y += position[1]
        width -= position[0]
        height -= position[1]
        break;
      case 1:
        y += position[1]
        width += position[0]
        height -= position[1]
        break;
      case 2:
        width += position[0];
        height += position[1];
        break;
      case 3:
        x += position[0];
        width -= position[0];
        height += position[1];
        break;
    }
    
    this.nodeBackup.resize({x,y,width,height});
    if(done){
      this.renderResizeCPs()
      zr.position = [0,0]
    }else{
      this.renderResizeCPs(idx);
    }
    console.log('resizeRect', 'position', position,'idx', idx,'rect', x, y,width,height)
  }

  render(){
    // render active node & line & resize points
    if(this.data){
      this.renderResizeCPs()
    }
  }

  // redraw by data
  open(){

  }


}