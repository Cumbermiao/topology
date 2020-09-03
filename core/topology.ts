import Store from './store';
import TopologyData from './models/data';
import ActiveLayer from './activeLayer';
import OffscreenLayer from './offscreenLayer';
import zrender from 'zrender';
import { Lock, zMouseEvent, NodeType, log } from './declare';
import { Line, Node } from './models/pen';
import Point from './models/point';
import HoverLayer from './hoverLayer';
import ResizeCP from './models/resizeCP';

enum MoveInType {
  None,
  Line,
  LineMove,
  LineFrom,
  LineTo,
  LineControlPoint,
  Nodes,
  ResizeCP,
  HoverAnchors,
  Rotate,
}
const resizeCursors = ['nw-resize', 'ne-resize', 'se-resize', 'sw-resize'];

export class Topology{
  
  data: TopologyData;
  mouseDown: { x: number; y: number; restore?: boolean };
  moveIn: {
    type: MoveInType;
    activeAnchorIndex: number;
    hoverAnchorIndex: number;
    hoverNode: Node;
    hoverLine: Line;
    activeNode: Node;
    lineControlPoint: Point;
    resizeCP: ResizeCP;
  } = {
    type: MoveInType.None,
    activeAnchorIndex: 0,
    hoverAnchorIndex: 0,
    hoverNode: null,
    hoverLine: null,
    activeNode: null,
    lineControlPoint: null,
    resizeCP: null
  };

  lastHoverNode: Node;
  lastHoverLine: Line;

  scheduledAnimationFrame: boolean;
  raf: number;

  activeLayer: ActiveLayer;
  hoverLayer: HoverLayer;
  offscreenLayer: OffscreenLayer;

  constructor(public el:HTMLElement, options?:any){
    const renderer = zrender.init(el);
    this.data = new TopologyData(options.data);
    (window as any).topology = this;
    Store.set('topology-data', this.data);
    Store.set('topology-renderer', renderer);

    this.activeLayer = new ActiveLayer();
    this.hoverLayer = new HoverLayer();
    this.offscreenLayer = new OffscreenLayer();

    // renderer.on('mousemove', this.mousemove)
    renderer.on('mousedown', this.mousedown)
    // renderer.on('mouseup', this.mouseup)
    // renderer.on('click', this.click)
    // renderer.on('dragstart', this.dragstart)
    renderer.on('drag', this.drag)
    renderer.on('dragend', this.dragend)
    // renderer.on('dragenter', this.dragenter)
    // renderer.on('dragleave', this.dragleave)
    // renderer.on('dragover', this.dragover)
    // renderer.on('drop', this.drop)
    
  }

  private dragstart = (e: zMouseEvent)=>{
    /**
     * TODO:
     * [] ResizeCP drag
     */
    log('dragstart', e)
  }

  private drag = (e: zMouseEvent)=>{
    if(!e.target) return;
    log('drag', e);
    const node = e.target._node;
    if(node.type === NodeType.ResizeCP){
      this.activeLayer.resizeRect(e.target._node)
    }else if(node.type === NodeType.Node){
      node.translate()
    }
    
  }

  private dragend = (e: zMouseEvent)=>{
    if(!e.target) return;
    log('dragend', e)
    // 缩放结束， 使用 activeLayer中的 backup 替换 data 中对应的节点
    this.dispatch('resize-node', e)
    const type = e.target._node.type;
    if(type === NodeType.ResizeCP){
      this.activeLayer.resizeRect(e.target._node, true)
    }
    
  }

  // private dragenter = (e: zMouseEvent)=>{
  //   log('dragenter', e)
  // }

  // private dragleave = (e: zMouseEvent)=>{
  //   log('dragleave', e)
  // }

  // private dragover = (e: zMouseEvent)=>{
  //   log('dragover', e)
  // }

  // private drop = (e: zMouseEvent)=>{
  //   log('drop', e)
  // }

  private mousemove = (e: zMouseEvent) => {
    const event = e.event;
    if(this.data.locked === Lock.NoEvent) return;

    // if(this.mouseDown && this.moveIn.type === MoveInType.None){
    //   let translate = false;
    //   if(event.ctrlKey || event.altKey || event.shiftKey) translate = true;
    //   if(translate){
    //     // TODO: translate canvas
    //     this.translate();
    //     return;
    //   }
    // }

    // 如果 data 设置了 lock 为 Readonly|NoEvent 不响应任何操作
    if(this.data.locked && this.mouseDown && this.moveIn.type !== MoveInType.None) return;


    this.scheduledAnimationFrame = true;

    if(this.raf) cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(()=>{
      this.raf = null;

      this.getMoveIn(e);
      log(this.moveIn.type)

      // NOTE: hover event
      if(!this.mouseDown){
        if(this.moveIn.hoverNode !== this.lastHoverNode){
          this.dispatch('moveOutNode', this.lastHoverNode);

          // this.hoverLayer.node = null;
        }

        if(this.moveIn.hoverNode){
          // this.hoverLayer.node = this.moveIn.hoverNode;
          this.dispatch('moveInNode', this.moveIn.hoverNode);
        }

        if(this.moveIn.hoverLine){
          this.dispatch('moveInLine', this.moveIn.hoverLine);
        }

        if(this.moveIn.type === MoveInType.LineControlPoint){
          // this.hoverLayer.hoverLineCP = this.moveIn.lineControlPoint;
        }
        // else if(this.hoverLayer.hoverLineCP){
        //   this.hoverLayer.hoverLineCP = null;
        // }

        if(
          this.moveIn.hoverNode !== this.lastHoverNode ||
          this.moveIn.type === MoveInType.HoverAnchors
          // || this.hoverLayer.lastHoverLineCP !== this.hoverLayer.hoverLineCp
        ){
          // this.hoverLayer.lastHoverLineCP = this.hoverLayer.hoverLineCP;
          this.render();
        }
        this.scheduledAnimationFrame = false;
        return;
      }

      // NOTE: drag event

      //TODO: Move out parent element

      switch (this.moveIn.type){
        case MoveInType.None:
          break;
        case MoveInType.Nodes:
          if(this.activeLayer.locked()){
            break;
          }
          // TODO: move nodes
      }

    })
  }

  private mousedown = (e: zMouseEvent) => {
    if(e.event.button!==0) return;
    /**
     * TODO: 
     * [x] change active node = null
     */
    log('mousedown in Topology',e);
    if(e.target) {
      const node = e.target._node;
      switch (node.type){
        case NodeType.Node:
          Store.set('active-node', node);
          break;
      }
    }else{
      Store.set('active-node', null);
    }
  }

  private mouseup = (e: zMouseEvent) => {
    // only response to left click.
    if(e.event.button!==0)return;

    log('mouseup', e)
    if(this.mouseDown){
      // TODO: drag end
    }
  }

  private click = (e: zMouseEvent) => {
    // TODO:  ?change MoveInType
    log('click')
    this.moveIn={
      type: MoveInType.None,
      activeAnchorIndex: 0,
      hoverAnchorIndex: 0,
      hoverNode: null,
      hoverLine: null,
      activeNode: null,
      lineControlPoint: null,
      resizeCP: null
    }
  }

  translate(){}

  getMoveIn(e: zMouseEvent){
    this.lastHoverNode = this.moveIn.hoverNode;
    this.lastHoverLine = this.moveIn.hoverLine;

    this.moveIn.type = MoveInType.None;
    this.moveIn.hoverNode = null;
    this.moveIn.hoverLine = null;
    this.moveIn.lineControlPoint = null;
    this.moveIn.hoverLine = null;

    if(e.target){
      const displayable = e.target;
      if(displayable._node.type === NodeType.Node){
        this.moveIn.type = MoveInType.Nodes;
        this.moveIn.hoverNode = displayable._node;
      }else if(displayable._node.type === NodeType.ResizeCP){
        this.moveIn.type = MoveInType.ResizeCP
      }
    }
    
  }

  dispatch(evtName, data){

  }

  render(){

  }
}