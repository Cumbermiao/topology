import Store from './store'
import { Topology } from './topology'
import { log } from './declare';

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
      log('pen in data', item)
      item.render(this.renderer)
    }
  }
}