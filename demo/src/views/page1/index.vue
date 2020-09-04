<template>
  <div class="workspace">
    <div class="tools">
      <div v-for="(item, index) in tools" :key="index">
        <div class="title">{{ item.group }}</div>
        <div class="buttons">
          <a
            v-for="(btn, i) in item.children"
            :key="i"
            :title="btn.name"
            :draggable="btn.data"
            @dragstart="onDrag($event, btn)"
          >
            <i :class="`iconfont ${btn.icon}`" />
          </a>
        </div>
      </div>
    </div>
    <div id="canvas-wrapper" class="content" />
  </div>
</template>
<script>
/* eslint-disable no-unused-vars */
import { Topology } from '~/topology'
// import zrender from 'zrender'
function isPrime(params) {
  const primes = ['string', 'number', 'bigint', 'boolean', 'undefined', 'symbol']
  if (primes.indexOf(typeof params) > -1) return true
  return params === null
}
export default {
  name: 'WorkSpace',
  props: {},
  data: function() {
    return {
      tools: [
        {
          group: '基础图形',
          children: [
            {
              name: 'rectangle',
              icon: 'icon-rect',
              data: {
                text: '矩形',
                name: 'rectangle',
                rect: {
                  width: 100,
                  height: 100
                }
              }
            },
            {
              name: 'triangle',
              icon: 'icon-triangle',
              data: {
                text: '三角形',
                name: 'triangle',
                rect: {
                  width: 100,
                  height: 100
                }
              }
            },
            {
              name: 'circle',
              icon: 'icon-circle',
              data: {
                text: '圆形',
                name: 'circle',
                rect: {
                  width: 100,
                  height: 100
                }
              }
            }
          ]
        }
      ],
      topology: null,
      grapherOptions: {
        showGrid: true,
        bgColor: '#DCDCDC'
      }
    }
  },
  mounted() {
    const el = document.getElementById('canvas-wrapper')
    window.topology = this.topology = new Topology(el, {
      data: {
        bgColor: '#dcdcdc',
        showGrid: true,
        pens: [
          {
            name: 'rectangle',
            text: 'rectangle \n something else',
            // textRect: {
            //   x: 20,
            //   y: 20,
            //   width: 50,
            //   height: 50
            // },
            textStyle: {
              textFill: 'blue',
              textStroke: 'red',
              textShadowColor: 'rgba(0,0,0,0.5)',
              textShadowBlur: 10,
              textShadowOffsetX: -1,
              textBorderColor: 'lightblue',
              textBorderWidth: 2,
              textPosition: 'inside'
            },
            rect: {
              x: 100,
              y: 100,
              width: 100,
              height: 100
            }
          }
          // {
          //   name: 'rectangle',
          //   text: 'rectangle2',
          //   textRect: {
          //     x: 20,
          //     y: 20,
          //     width: 50,
          //     height: 50
          //   },
          //   textStyle: {
          //     textFill: 'blue',
          //     textStroke: 'red'
          //   },
          //   rect: {
          //     x: 300,
          //     y: 100,
          //     width: 60,
          //     height: 60
          //   },
          //   lock: 0
          // },
          // {
          //   from: { x: 200, y: 150 },
          //   to: { x: 500, y: 150 },
          //   arrowType: ['', 'triangleSolid'],
          //   lineColor: 'blue'
          // }
        ]
      }
    })
  },
  methods: {
    onDrag(e, model) {
      e.dataTransfer.setData('topology', JSON.stringify(model.data))
    },
    matrix() {

    }
  }
}
</script>
<style lang="scss">
body{
    background-color: lightgrey;

}
.workspace{
  height: 100vh;
  display: flex;

  .tools{
    width: 160px;
    height: 100%;
    overflow-y: auto;
    background-color: #f5f5f5;
    border-right:  1px solid #d9d9d9;
    .title {
      color: #0d1a26;
      font-weight: 600;
      font-size: 16px;
      line-height: 1;
      padding: 6px 12px;
      margin-top: 6px;
      border-bottom: 1px solid #ddd;

      &:first-child {
        border-top: none;
      }
    }

    .buttons {
      padding: 6px 0;
      a {
        display: inline-block;
        color: #314659;
        line-height: 40px;
        width: 40px;
        height: 40px;
        text-align: center;
        text-decoration: none !important;
        cursor: pointer;

        .iconfont {
          font-size: 30px;
        }

        &:hover {
          color: #1890ff;
        }
      }
    }
  }

  .content{
    // margin: 20px;
    // height: calc(100% - 40px);
    flex-grow: 1;
    // background-color: #fff;
  }
}
</style>
