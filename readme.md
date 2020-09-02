## TODO:

- controller 如何控制整个 Model 大小？ 通信方式

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