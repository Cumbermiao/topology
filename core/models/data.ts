import { Node, Line, Pen } from './pen'
import { Lock } from '../declare'

export default class TopologyData {
  pens: any[];
  lineName = 'curve';
  fromArrowType = '';
  toArrowType = 'triangleSolid';
  scale = 1;
  locked = Lock.None;
  bgImage: string = '';
  bgColor: string = '#fff';
  showGrid: boolean = false;

  data?: any;
  history:Pen[] = [];

  constructor(json?:any) {
    if(json){
      const { lineName, fromArrowType, toArrowType, bgImage, bgColor, showGrid, pens } = json
      lineName && (this.lineName = lineName);
      fromArrowType && (this.fromArrowType = fromArrowType);
      toArrowType!==undefined && (this.toArrowType = toArrowType);
      bgImage!==undefined && (this.bgImage = bgImage);
      bgColor && (this.bgColor = bgColor);
      showGrid && (this.showGrid = showGrid);

      this.pens = [];
      for(const item of pens){
        //TODO: new Line or new Node
        if(item.from || item.to){
          this.pens.push(new Line(item))
        }else this.pens.push(new Node(item))
        
      }
    }
  }

  replacePen(data:Node|Line){
    for(let i=this.pens.length; i>0; i--){
      if(this.pens[i].id === data.id){
        this.pens[i].dispose();
        this.pens[i] = data;
        break;
      }
    }
  }

  dispatch(name:string, args?:any){

  }
}