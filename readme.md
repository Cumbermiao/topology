## TODO:

- controller 如何控制整个 Model 大小？ 通信方式

- Node 节点 resize 之后 resizeCP 不响应事件。

## 框架分层设计

### TopologyData

```ts
class TopologyData{
  // ...topology 的一些基础配置

  pens: Pen[];
  construction(json?:any){
    //... 基础配置处理
    
    this.history = []
    if(json?.data.length){
      json.data.forEach(item=>{
        if(item.from || item.to) this.pens.push(new Line(item))
        else this.pens.push(new Node(item))
      })
    }
  }

  remove(pen:Pen){
    const idx = this.pens.indexOf(pen)
    if(idx>-1){
      this.pens.splice(idx,1)
      pen.dispose()
    }
  }

  replace(pen:Pen){
    const idx = this.pens.length - 1;
    while(idx>=0){
      if(this.pens[idx]?.id === pen.id){
        this.pens[idx].dispose();
        this.pens[idx] = pen;
      }else idx --
    }
  }
}
```

### OffscreenLayer

> 稳定视图层

```ts
class Offscreen{
  data: TopologyData
  renderer: any

  construction(){
    this.data = Store.get('topology-data')
    this.renderer = Store.get('topology-renderer')
  }

  render(){
    this.data.pens.forEach(item=>item.render(this.renderer))
  }

  submit(){
    // ajax submit data
  }
}
```

### ActiveLayer

> 活动视图层： 负责 resize 控制点的绘制， 节点的缩放、位移等，节点连线的绘制，

```ts
class ActiveLayer{
  data: Pen;
  backup: Pen;
  resizeCP: ResizeCP[];

  constructor(){
    Store.subscribe('active-node', node =>{
      this.activeNode(node)
    })
    Store.subscribe('active-resize', rect => {
      this.resize(rect)
    })
  }
  
  resize({x,y,width,height}, done?:boolean){
    if(this.backup){
      // ... logic code
      
      if(done){
        const data = Store.get('topology-data')
        data.replaceWith(this.backup)
      }
    }
  }
}
```

## 数据结构

### 位置信息
```ts
interface Rect{
  x: Number
  y: Number
  width: Number
  height: Number
}
```

### 字体样式
```ts
interface FontStyle{
  fontSize: Number
  fontWeight: Number
  color: String
}
```
### 线条样式
```ts
interface LineStyle{
  lineColor: String
  lineStyle: String
  lineWidth: Number
}
```

### 节点样式
```ts
interface NodeStyle{
  bgColor: String
  bgImage: String
}
```


- 模型对象
```ts
{
  name: String
  rect: Rect
  icon: any
  title: String
  zIndex: Number
  params: any
  position: number[]
  scale: number[]
}
```

- 连接线
```ts
{
  type: string,
  fromArrow: string,
  toArrow: string,
  from: any
  to: any
  zIndex: Number
  params: any
}
```

- 矩形
```ts
{
  rect: Rect
  lineWidth: Number
  lineColor: String
  lineStyle: String
  zIndex: Number
  bgColor: String
  bgImage: String
  opacity: Number
}
```

- 文本
```ts
{
  rect: Rect
  text: String
  ...FontStyle
  textAlign: String
  zIndex: Number
}
```
- 画布

```ts
{
  rect: Rect
  bgColor: String
  bgImage: String
  showGrid: Boolean
}
```

