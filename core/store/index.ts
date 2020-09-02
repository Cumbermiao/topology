import Observer from './observer'

export const defaultStore = {
  state: {},
  observers: {},
};

export const s4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
export const s8 = () => (s4() + s4());

export default class Store {
  state;
  observers;
  constructor() {
    this.state = {};
    this.observers = {};
  }

  static get(key?: string, state = defaultStore.state) {
    if (key === undefined) return state;

    const props = key.split(".");
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      state = state[prop];
      if (state === undefined) break;
    }
    return state;
  }

  static set(key: string, value, state = defaultStore.state, observers = defaultStore.observers):void {
    const props = key.split(".");
    let _store = state;
    for (let i = 0; i < props.length-1; i++) {
      if(!_store[props[i]]){
        _store[props[i]] = {};
      }
      _store = _store[props[i]]
    }
    _store[props[props.length - 1]] = value;
    for( let id in observers){
      // 子属性改变触发父属性订阅 obj.name 触发 obj
      // TODO: obj.name, ob.name 是否冲突
      if(key.indexOf(observers[id].key)===0){
        observers[id].fn(Store.get(observers[id].key, state))
      }
    }
  }

  static update(key: string, state = defaultStore.state, observers = defaultStore.observers){
    for(let id in observers){
      if(key.indexOf(observers[id].key) === 0){
        observers[id].fn(Store.get(observers[id].key, state))
      }
    }
  }

  static subscribe(key: string, fn: (data) => void, state = defaultStore.state, observers = defaultStore.observers):Observer{
    const id = s8();
    const observer = new Observer(id, key, fn);
    observers[id] = observer;
    const value = Store.get(key, state);
    // NOTE: 触发 fn 如果之前已经给 key 设了 value
    value !== undefined && fn(value);
    return observer
  }

  get(key?: string){
    return Store.get(key, this.state)
  }
  set(key: string, value):void{
    Store.set(key, value, this.state, this.observers)
  }
  update(key: string):void{
    Store.update(key, this.state, this.observers)
  }
  subscribe(key: string, fn: (data) => void):Observer{
    return Store.subscribe(key, fn, this.state, this.observers)
  }
}
