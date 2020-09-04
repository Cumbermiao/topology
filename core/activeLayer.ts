import Store from './store'
import Rect from './models/rect'
import { Topology } from './topology'
import ResizeCP from './models/resizeCP'
import { Node } from './models/pen';
import { log, Lock, storeKey } from './declare';

const resizeCursors = ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'];

export default class ActiveLayer {
  protected data; // offscreen actived node
  protected renderer;
  nodeBackup;
  resizeCP: ResizeCP[]=[];
  raf = null;
  z = 100;
  nodePosition: number[] =null; // node 节点位移的 position
  points = [];
  constructor() {
    this.renderer = Store.get('topology-renderer');
    
    Store.subscribe(storeKey.activeNode, nodes=>{
      // log('active-node in ActiveLayer.constructor', nodes);

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
      // log('nodebackup', this.nodeBackup)
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

  onMove(done?:boolean){
    // log('onMove', this.data._zr[0].position)
      this.renderResizeCPs();
      if(done){
        // TODO: use position instead of recalc rect
      this.renderResizeCPs();
      // this.data.recalcRectInfos();
      }
   
  }

  renderResizeCPs(exludeIdx?:number){
    const rect: Rect = this.getRect();
    const position = this.data?._zr[0]?.position;
    this.points = [
      [rect.x - 5, rect.y-5],
      [rect.x-5 + rect.width, rect.y-5], 
      [rect.x-5 + rect.width, rect.y-5 + rect.height], 
      [rect.x-5, rect.y-5 + rect.height]];
    if(position){
      this.points.forEach(item=>{
        item[0] += position[0];
        item[1] += position[1];
      })
    }
    // log('renderResizeCPS',position)
    if(!this.resizeCP.length){
      this.resizeCP = this.points.map(([x,y],i)=>new ResizeCP(x,y,resizeCursors[i]));
      this.resizeCP.forEach(item=>item.render(this.renderer));
    }else{
      this.resizeCP.forEach((item, idx)=>{
        if(idx !== exludeIdx){
          item.x = this.points[idx][0]
          item.y = this.points[idx][1]
        }
        // else{
        //   switch (exludeIdx){
        //     case 0: 
        //       if(points[exludeIdx][0]>points[1][0]-5) points[exludeIdx][0] = points[1][0]-5;
        //       if(points[exludeIdx][1]>points[2][1]-5) points[exludeIdx][1] = points[2][1]-5;
        //       break;
        //     case 1:
        //       if(position[exludeIdx][0]<position[0][0]+5) 
        //   }
        // }
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
    // log('resizeRect in ActiveLayer')
    const idx = resizeCursors.indexOf(resizeCP.cursor);
    const zr = resizeCP._zr;
    let [offsetX, offsetY] = zr.position;

    let { x, y, width, height } = this.getRect(true);
    let needRefresh = false
    switch (idx){
      case 0:
        if(offsetX > width - 10){
          offsetX = width - 10
          needRefresh = true
        }
        if( offsetY > height - 10){
          offsetY = height - 10
          needRefresh = true
        }

        x += offsetX
        y += offsetY
        width -= offsetX
        height -= offsetY
        break;
      case 1:
        if( offsetX < 10 - width){
          offsetX = 10 - width
          needRefresh = true
        }
        if( offsetY > height - 10){
          offsetY = height - 10
          needRefresh = true
        }

        y += offsetY
        width += offsetX
        height -= offsetY
        break;
      case 2:
        if(offsetX < 10 - width){
          offsetX = 10 - width
          needRefresh = true
        }
        if(offsetY < 10 - height){
          offsetY = 10 - height
          needRefresh = true
        }

        width += offsetX;
        height += offsetY;
        break;
      case 3:
        if(offsetX > width - 10){
          offsetX = width - 10
          needRefresh = true
        }
        if(offsetY < 10 - height){
          offsetY = 10 - height
          needRefresh = true
        }

        x += offsetX;
        width -= offsetX;
        height += offsetY;
        break;
    }

    needRefresh && zr.attr('position',[offsetX, offsetY])

    
    this.data.resize({x,y,width,height});
    if(done){
      this.renderResizeCPs()
      zr.attr('position',[0,0])
      log('moveDone', zr)
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