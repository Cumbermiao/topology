import Store from './store'
import Rect from './models/rect'
import { Topology } from './topology'
import ResizeCP from './models/resizeCP'
import { Node } from './models/pen';
import { log, Lock } from './declare';

const resizeCursors = ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'];

export default class ActiveLayer {
  protected data; // offscreen actived node
  protected renderer;
  nodeBackup;
  resizeCP: ResizeCP[]=[];
  raf = null;
  z = 100;

  constructor() {
    this.renderer = Store.get('topology-renderer');
    
    Store.subscribe('active-node', nodes=>{
      log('active-node in ActiveLayer.constructor', nodes);

      if(!nodes) {
        this.data = undefined;
        this.nodeBackup = undefined;
        this.hideResizeCP();
        return;
      }
      
      if(this.data && this.data!==nodes){
        this.data?.dispose();
      }
      this.data = nodes;
      this.nodeBackup = new Node(nodes);
      this.nodeBackup.render(this.renderer);
      this.nodeBackup.hide();
      log('nodebackup', this.nodeBackup)
      this.render();
    })

  }

  locked(){
    return this.data.lock;
  }

  getRect(backup?:boolean){
    if(backup && this.nodeBackup) return this.nodeBackup.rect
    if(!backup && this.data) return this.data.rect
  }

  renderResizeCPs(exludeIdx?:number){
    log('renderResizeCPS')
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
    log('resizeRect in ActiveLayer')
    const idx = resizeCursors.indexOf(resizeCP.cursor);
    const zr = resizeCP._zr;
    const position = zr.position;
    let { x, y, width, height } = this.getRect(true);
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
    
    this.data.resize({x,y,width,height});
    if(done){
      this.renderResizeCPs()
      zr.position = [0,0]
    }else{
      this.renderResizeCPs(idx);
    }
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