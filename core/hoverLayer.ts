import Store from './store'
import { Topology } from './topology'

export default class HoverLayer {
  protected data;
  protected renderer;

  constructor() {
    // this.data = Store.get('topology-data');
    this.renderer = Store.get('topology-renderer');
    
    Store.subscribe('hover-node',(nodes)=>{
      this.data = nodes;
      this.render();
    })
  }

  locked(){
    return this.data.lock;
  }

  render(){
    // render active node & line & resize points
    if(this.data){
      console.log(this.data)
    }
  }

  // redraw by data
  open(){

  }


}