import { defaultStore } from './index'

export default class Observer{
  key: string = '';
  id: string | number;
  fn: Function;

  constructor(id: string, key: string, fn:Function){
    this.id = id;
    this.key = key;
    this.fn = fn;
  }

  unsubscribe(){
    delete defaultStore.observers[this.id];
  }
}