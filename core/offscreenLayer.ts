import Store from './store'
import { Topology } from './topology'

export default class OffscreenLayer {
  protected data;
  protected renderer;

  constructor() {
    this.data = Store.get('topology-data');
    this.renderer = Store.get('topology-renderer');
    
    this.render();
  }

  locked(){
    return this.data.lock;
  }

  render(){
    // render nodes
    for( const item of this.data.pens){
      item.render(this.renderer)
    }
  }
}