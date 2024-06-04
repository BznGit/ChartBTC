
<template>
  <input type="number"  @input="setHightlightHashrate" v-model="hightlightHashrate">
  <LineChart ref="lineRef" :chartData="chartData" :options="chartOptions"  />
  <LineChart class= "smallChart"  ref="smallLineRef" :chartData="smallChartData" :options="smallChartOptions"  />
  <span>{{ date1 }} - {{ date2 }}</span>
</template>
 <script setup>
  import { LineChart } from "vue-chart-3";
  import { Chart, registerables } from "chart.js";
  import { ref, reactive,   onMounted, computed, watch, onUpdated, defineCustomElement } from 'vue';
  import 'chartjs-adapter-date-fns';
  import 'chartjs-plugin-dragdata'
  import zoomPlugin from 'chartjs-plugin-zoom';

  const props = defineProps({
     idChart: Number,
     from: String, 
     data: Object,
     koef: String
   })
  const lineRef = ref()
  const hightlightHashrate = ref() 
  const emit = defineEmits(['onzoom' ])

  onMounted(() => {
    let chart = lineRef.value.chartInstance;
    let smallChart = smallLineRef.value.chartInstance;
 
    smallChart.config.options.layout.padding.left =  chart.chartArea.left - chart.config.options.layout.padding.left
    smallChart.config.options.layout.padding.right = chart.width - chart.chartArea.right
    smallChart.data.datasets[0].data = chart.data.datasets[0].data 

    smallChart.update('none')
    zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max ) 
  });

  function setHightlightHashrate(event){
    if(highlighArrIndex.length==0) return
    let chart = lineRef.value.chartInstance
    let smallChart = smallLineRef.value.chartInstance
    highlighArrIndex.forEach(index=>{
      chart.data.datasets[0].data[index].y = event.target.value
      smallChart.data.datasets[0].data [index].y = event.target.value

    })
    chart.update()  
    smallChart.update('none')
    zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max ) 
  }
  let highlighArrIndex = [];
  function highlightDatasetsPoints(setData){
    let chart = lineRef.value.chartInstance;

    chart.data.datasets[0].data.forEach((item, index)=>{
      if(((+setData.startX < +item.x &&  +item.x < +setData.endX) || (+setData.startX > +item.x &&  +item.x > +setData.endX))
      && ((+setData.startY < +item.y &&  +item.y < +setData.endY) || (+setData.startY > +item.y &&  +item.y > +setData.endY)))
        highlighArrIndex.push(index)
    })
    
    highlighArrIndex.forEach(index=>{
      chart.data.datasets[0].pointBorderColor[index] = 'red'
      chart.data.datasets[0].backgroundColor[index] = 'red'
    })
   chart.update()  
}

  let setData;
  let rectangelXY;
  const rectangel = {
    id: 'rectangel',
    // drawing part
    afterDatasetsDraw: (chart, args, plugins) => {
      const {ctx, chartArea:  {left, right, top, bottom}, scales: {x, leftyaxis}}  = chart;
      if(rectangelXY){
        ctx.save();
        ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
           
        let width = rectangelXY.startX - rectangelXY.endX
        let height = rectangelXY.startY - rectangelXY.endY
       
        setData = {
          startX: x.getValueForPixel(rectangelXY.startX),
          startY: leftyaxis.getValueForPixel(rectangelXY.startY),
          endX:   x.getValueForPixel(rectangelXY.endX),
          endY:   leftyaxis.getValueForPixel(rectangelXY.endY)
        }
        ctx.fillRect(rectangelXY.startX - width, rectangelXY.startY - height, width, height);
       
      }
    },

    afterInit: (chart, args, plugins) => {
      const {ctx, canvas,  scales: {x, leftyaxis}}  = chart; 
      
      canvas.onclick = (e) =>{ 
          if(highlighArrIndex.length!=0){
           
            highlighArrIndex.forEach(index=>{
              chart.data.datasets[0].pointBorderColor[index] = '#0068dd'
              chart.data.datasets[0].backgroundColor[index] = '#0068dd'
              highlighArrIndex = []
            })
            chart.update()
          }
      };
      canvas.oncontextmenu = (e) =>{ 
          e.preventDefault();
      };

      let mouseDown = false;
      canvas.onmousedown = (e) => {
      
        mouseDown = true;

        rectangelXY = 
          {
            startX: e.offsetX,
            startY: e.offsetY,
            endX:  e.offsetX,
            endY:  e.offsetY,
          }
          args.changed = true;
      }; 
      canvas.onmouseup = (e)=>{
        mouseDown = false;
        //data.value[0].y = setData.endY
        highlightDatasetsPoints(setData)
        rectangelXY.startX = 0
        rectangelXY.startY = 0
        rectangelXY.endX = 0
        rectangelXY.endY = 0
        
        e.preventDefault()
      }
      canvas.onmousemove  = (e)=>{
        if(!mouseDown) return
        rectangelXY.endX = e.offsetX,
        rectangelXY.endY = e.offsetY
    
      }
    }
  }
  let crosshair;
  const crosshairLabel = {
    id: 'crosshairLabel',
    // drawing part
    afterDatasetsDraw: (chart, args, plugins) => {
      const {ctx, chartArea:  {left, right, top, bottom}, scales: {x, leftyaxis}}  = chart;   
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'grey';
      ctx.setLineDash([5, 3])
      if(crosshair){
        ctx.save();
        ctx.beginPath()
        crosshair.forEach((line, index)=>{
          ctx.moveTo(line.startX, line.startY);
          ctx.lineTo(line.endX, line.endY);
          ctx.stroke();
        })
        ctx.fillStyle = 'grey'
        ctx.fillRect(0, crosshair[0].startY - 10, left, 20);
        ctx.fillRect(crosshair[1].startX - 50, bottom, 100, 20);
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom'
        ctx.fillStyle = 'white';
        ctx.fillText(leftyaxis.getValueForPixel(crosshair[0].startY).toFixed(2), left / 2, crosshair[0].startY + 7)
        ctx.fillText(new Date(x.getValueForPixel(crosshair[1].startX)).toDateString(), crosshair[1].startX, bottom + 17)
      }
    },
    // mouse move
    afterEvent(chart, args){
      const {ctx, chartArea:  {left, right, top, bottom} }  = chart;
      const xCoor = args.event.x;
      const yCoor = args.event.y

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'grey';

      if(!args.inChartArea && crosshair){
        crosshair = undefined;
        args.changed = true;
      } else if(args.inChartArea){
        crosshair = [
          {
            startX: left,
            startY: yCoor,
            endX: right,
            endY: yCoor,
          },
          {
            startX: xCoor,
            startY: top,
            endX: xCoor,
            endY: bottom,
          },
        ];
        args.changed = true;
      }      
    }
}
  const plugin = {
    id: 'verticalLiner',
    afterInit: (chart, args, opts) => {
      chart.verticalLiner = {}
    },
    afterEvent: (chart, args, options) => {
      const {inChartArea} = args
      chart.verticalLiner = {draw: inChartArea}
    },
    beforeTooltipDraw: (chart, args, options) => {
   
      const {draw} = chart.verticalLiner
      if (!draw) return

      const {ctx } = chart
      const {top, bottom, left, right} = chart.chartArea
      const {tooltip} = args
      console.log('>>', )
      const x = tooltip?.caretX
      const y = tooltip?.caretY
      if (!x) return
      ctx.save()
      ctx.beginPath()
      ctx.setLineDash([5, 3])
      ctx.strokeStyle = '#ff0000';
      ctx.moveTo(x, top)
      ctx.lineTo(x, bottom)
      ctx.moveTo(left, y)
      ctx.lineTo(right, y)
      ctx.stroke()
      ctx.restore()
    }
  }

  Chart.register(crosshairLabel, rectangel, zoomPlugin, ...registerables);

  let chartOptions = computed(()=>{
    return {
      dragData: true,
      maintainAspectRatio: false,
      layout:{
        padding:{
         left: 0,
         right: 0
        }
      }, 
     
     interaction: {
       mode: 'index',
       intersect: false,
     },
     hover: {
            intersect: false,
            mode: 'dataset',
        },
        onHover: function(e) {
            const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
            if (point.length) e.native.target.style.cursor = 'grab'
            else e.native.target.style.cursor = 'default'

          },
     plugins: {

      zoom: {
         limits: {
              x: {
                min: +data[0].x,
                max: +data[data.length-1].x
              },
        
        },
        zoom: {
         
          onZoom: ()=>{
            let chart = lineRef.value.chartInstance;
            zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max )
          },

          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: false
          },
          mode: 'x',
        }
      }, 
      dragData: {
   
          round: 0, // rounds the values to n decimal places
          // in this case 1, e.g 0.1234 => 0.1)
          showTooltip: false, // show the tooltip while dragging [default = true]
          // dragX: true // also enable dragging along the x-axis.
          // this solely works for continous, numerical x-axis scales (no categories or dates)!
          onDragStart: function (e, datasetIndex, index, value) {
            highlighArrIndex.push(index)
            hightlightHashrate.value = value.y
            let chart = lineRef.value.chartInstance;
            chart.data.datasets[datasetIndex].pointBorderColor[index] = 'red'
            chart.data.datasets[datasetIndex].backgroundColor[index] = 'red'
            chart.update()
          },
          onDrag: function (e, datasetIndex, index, value) {
            hightlightHashrate.value = value.y
            if (highlighArrIndex.length!=0){
              let chart = lineRef.value.chartInstance;
              let smallChart = smallLineRef.value.chartInstance;
              let point = +value.x
              let left = +chart.data.datasets[datasetIndex].data[highlighArrIndex[0]].x;
              let right = +chart.data.datasets[datasetIndex].data[highlighArrIndex[highlighArrIndex.length-1]].x;
              if((left <= point &&  point <= right) || (left >= point &&  point >= right)){
                hightlightHashrate.value = value.y
                  highlighArrIndex.forEach(index1=>{
                  chart.data.datasets[datasetIndex].data[index1].y = value.y
                  smallChart.data.datasets[datasetIndex].data[index1].y = value.y
                })
                chart.update()
                smallChart.update('none')
                zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max )
                console.log('react')
              }
            }
          },
          onDragEnd: function (e, datasetIndex, index, value) {

          },
        },

       legend: {
         display:false,
         labels: {
           display:true,
           usePointStyle: false,
         },
       },
       tooltip: {
         usePointStyle: true,
         callbacks: {
           labelPointStyle: function(context) {
             return {
               pointStyle: 'circule',
               rotation: 0
             };
           },
           label: function(tooltipItems) {
             return 'Hashrate: '  + tooltipItems.parsed.y + ' ' + props.koef;
           }
         }
       }
     }, 
     scales: {
       x: {
          min: +data[0].x,
          max: +data[data.length-1].x,
         type: 'time',       
         time: {
           unit: 'day',
           displayFormats: {
             minute:'HH:mm',
             hour: 'HH:mm',
             day: 'dd.MM',
             week:'dd.MM.yy',
           }
         },
       },
       'leftyaxis': {
         type: 'linear',
         position: 'left',
         title: {text:"-",display: true},
         min: 0
       },
     }  
   }   
 })
let data =  [
  {x: +new Date(2024, 10, 1),  y: 11},
  {x: +new Date(2024, 10, 2),  y: 12}, 
  {x: +new Date(2024, 10, 3),  y: 6 },
  {x: +new Date(2024, 10, 4),  y: 7 }, 
  {x: +new Date(2024, 10, 5),  y: 9 }, 
  {x: +new Date(2024, 10, 6),  y: 5 },
  {x: +new Date(2024, 10, 7),  y: 7 }, 
  {x: +new Date(2024, 10, 8),  y: 6 },
  {x: +new Date(2024, 10, 9),  y: 2 }, 
  {x: +new Date(2024, 10, 10), y: 8 }, 
  {x: +new Date(2024, 10, 11),  y: 11},
  {x: +new Date(2024, 10, 12),  y: 12}, 
  {x: +new Date(2024, 10, 13),  y: 6 },
  {x: +new Date(2024, 10, 14),  y: 7 }, 
  {x: +new Date(2024, 10, 15),  y: 9 }, 
  {x: +new Date(2024, 10, 16),  y: 5 },
  {x: +new Date(2024, 10, 17),  y: 7 }, 
  {x: +new Date(2024, 10, 18),  y: 6 },
  {x: +new Date(2024, 10, 19),  y: 2 }, 
  {x: +new Date(2024, 10, 20),  y: 8 },
  {x: +new Date(2024, 10, 21),  y: 11},
  {x: +new Date(2024, 10, 22),  y: 12}, 
  {x: +new Date(2024, 10, 23),  y: 6 },
  {x: +new Date(2024, 10, 24),  y: 7 }, 
  {x: +new Date(2024, 10, 25),  y: 9 }, 
  {x: +new Date(2024, 10, 26),  y: 5 },
  {x: +new Date(2024, 10, 27),  y: 7 }, 
  {x: +new Date(2024, 10, 28),  y: 6 },
  {x: +new Date(2024, 10, 29),  y: 2 }, 
  {x: +new Date(2024, 10, 30), y: 8 },
  {x: +new Date(2024, 11, 1),  y: 11},
  {x: +new Date(2024, 11, 2),  y: 12}, 
  {x: +new Date(2024, 11, 3),  y: 6 },
  {x: +new Date(2024, 11, 4),  y: 7 }, 
  {x: +new Date(2024, 11, 5),  y: 9 }, 
  {x: +new Date(2024, 11, 6),  y: 5 },
  {x: +new Date(2024, 11, 7),  y: 7 }, 
  {x: +new Date(2024, 11, 8),  y: 6 },
  {x: +new Date(2024, 11, 9),  y: 2 }, 
  {x: +new Date(2024, 11, 10), y: 8 }, 
  {x: +new Date(2024, 11, 11),  y: 11},
  {x: +new Date(2024, 11, 12),  y: 12}, 
  {x: +new Date(2024, 11, 13),  y: 6 },
  {x: +new Date(2024, 11, 14),  y: 7 }, 
  {x: +new Date(2024, 11, 15),  y: 9 }, 
  {x: +new Date(2024, 11, 16),  y: 5 },
  {x: +new Date(2024, 11, 17),  y: 7 }, 
  {x: +new Date(2024, 11, 18),  y: 6 },
  {x: +new Date(2024, 11, 19),  y: 2 }, 
  {x: +new Date(2024, 11, 20),  y: 8 },
  {x: +new Date(2024, 11, 21),  y: 11},
  {x: +new Date(2024, 11, 22),  y: 12}, 
  {x: +new Date(2024, 11, 23),  y: 6 },
  {x: +new Date(2024, 11, 24),  y: 7 }, 
  {x: +new Date(2024, 11, 25),  y: 9 }, 
  {x: +new Date(2024, 11, 26),  y: 5 },
  {x: +new Date(2024, 11, 27),  y: 7 }, 
  {x: +new Date(2024, 11, 28),  y: 6 },
  {x: +new Date(2024, 11, 29),  y: 2 }, 
  {x: +new Date(2024, 11, 30), y: 8 },    
]
let dataset1 =  ref( {
         label:"Hashrate",
         borderColor: '#0068dd',
         backgroundColor: '#0068dd',
         cubicInterpolationMode: 'monotone',
         pointRadius: 3,
         yAxisID: 'leftyaxis',
         hidden: false,
         dragData: true,
         pointHoverRadius: 4,
         spanGaps: true,
         data: data,
         backgroundColor: ['#0068dd', '#0068dd','#0068dd','#0068dd','#0068dd'],
         pointBorderColor: ['#0068dd','#0068dd','#0068dd', '#0068dd','#0068dd']
       })

  const chartData = computed(()=>{
      return {
      datasets: [
      dataset1.value
      ] 
    }
  })
////////////////////// Small Chart /////////////////////////////////
const smallLineRef = ref()
const date1 = ref();
const date2 = ref()



function  zoomBox(min, max){

  let smallChart = smallLineRef.value.chartInstance;
  let chart = lineRef.value.chartInstance;
  const {ctx, canvas, chartArea: { top, bottom, left, right, width, height }, scales: {x, y} } = smallChart; 

 // let min = chart.config.options.scales.x.min;
 // let max = chart.config.options.scales.x.max;
 
  smallChart.update('none')
  zoomBoxItem(min, max)
  function zoomBoxItem(min, max){
    
    if(min === undefined){
      min = data[0].x
    }
    date1.value = new Date(min).toLocaleDateString()
    date2.value = new Date(max).toLocaleDateString()
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
    ctx.fillRect(x.getPixelForValue(min), top, x.getPixelForValue(max) - x.getPixelForValue(min),  height);
    ctx.closePath()

    swiperButton(x.getPixelForValue(min))
    swiperButton(x.getPixelForValue(max))

    function swiperButton(position){
      const angel = Math.PI * 180
      ctx.beginPath();
      ctx.fillStyle = '#0068dd';
      ctx.strokeStyle = '#0068dd';
      ctx.fillRect(position -5, (height / 2) - 10, 10, 20);
      ctx.lineWidth = 2;
      ctx.strokeRect(position -5 , (height / 2) - 10, 10, 20);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.restore();

      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(position - 2, (height / 2 - 7))
      ctx.lineTo(position - 2, (height / 2 + 7))
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(position + 2, (height / 2 - 7))
      ctx.lineTo(position + 2, (height / 2 + 7))
      ctx.stroke();
      ctx.restore();
    }
  };

  canvas.addEventListener('mousemove', (e) => {
    mouseCursore(e)
  })

  function mouseCursore(mousemove){
    let minChart1 = chart.config.options.scales.x.min;
    if (minChart1 === undefined || minChart1 === -1){
      minChart1 =data[0]
    }
    if (mousemove.offsetX >= x.getPixelForValue(minChart1) - 10 && mousemove.offsetX <= x.getPixelForValue(minChart1) + 10 ||
        mousemove.offsetX >= x.getPixelForValue(chart.config.options.scales.x.max) - 10 && mousemove.offsetX <= x.getPixelForValue(chart.config.options.scales.x.max) + 10){
      canvas.style.cursor = 'ew-resize'
    }else if(mousemove.offsetX > x.getPixelForValue(minChart1) + 10 && mousemove.offsetX < x.getPixelForValue(chart.config.options.scales.x.max) - 10){
      canvas.style.cursor = 'move'
    } else{
      canvas.style.cursor = 'default'
    }
  }

  canvas.addEventListener('mousedown', (e) =>{
    dragStart(e);
  })

  window.addEventListener('mouseup', (e) =>{
    canvas.onmousemove = null;
  })

  function dragStart(drag){
   let minChart1 = chart.config.options.scales.x.min;
    if (minChart1 === undefined || minChart1 === -1){
      minChart1 = data[0].x
    }
    if(drag.offsetX >= x.getPixelForValue(minChart1) - 10 && drag.offsetX <= x.getPixelForValue(chart.config.options.scales.x.min) + 10){
      canvas.onmousemove = (e) => {
       // let chart = lineRef.value.chartInstance;
        dragMove(chart, e);
      };

      function dragMove(chart, dragDelta){

        const timestamp = x.getValueForPixel(dragDelta.offsetX);
        const dayTimestamp = new Date(timestamp).setHours(0, 0, 0, 0)
        let scrollPoint = data.findIndex(item => item.x == dayTimestamp)
       // console.log(scrollPoint)
      

        if(dragDelta.offsetX < left) scrollPoint = 0; 
        if(dragDelta.offsetX > right ){
          scrollPoint = data.findIndex(item => item.x == chart.config.options.scales.x.max ) - 1;
        } 
        if(scrollPoint > data.findIndex(item => item.x == chart.config.options.scales.x.max) - 1) {
          scrollPoint = data.findIndex(item => item.x == chart.config.options.scales.x.max) - 1
        }
       // console.log(data[scrollPoint], scrollPoint)
        chart.config.options.scales.x.min = data[scrollPoint].x
        chart.update('none')
        smallChart.update('none');
        zoomBoxItem(data[scrollPoint].x, chart.config.options.scales.x.max)
      }
    };

    if(drag.offsetX >= x.getPixelForValue(chart.config.options.scales.x.max) - 10 &&
     drag.offsetX <= x.getPixelForValue(chart.config.options.scales.x.max) + 10){
      canvas.onmousemove = (e) => {
       // let chart = lineRef.value.chartInstance;
        dragMove(chart, e);
      }
      function dragMove(chart, dragDelta){
        const timestamp = x.getValueForPixel(dragDelta.offsetX);
        const dayTimestamp = new Date(timestamp).setHours(0, 0, 0, 0)
        let scrollPoint = data.findIndex(item => item.x == dayTimestamp)
       // console.log(scrollPoint)

        if(dragDelta.offsetX > right && scrollPoint === -1) scrollPoint = data[data.length - 1].x; 
        if(dragDelta.offsetX < left ){
          console.log('first>',scrollPoint)
          scrollPoint = data.findIndex(item => item.x == chart.config.options.scales.x.min ) + 1;
        } 
        if(scrollPoint < data.findIndex(item => item.x == chart.config.options.scales.x.min) + 1 ) {
          scrollPoint = data.findIndex(item => item.x == chart.config.options.scales.x.min) + 1
        }
        //console.log(data[scrollPoint], scrollPoint)
        chart.config.options.scales.x.max = data[scrollPoint].x
        chart.update('none')
        smallChart.update('none');
        zoomBoxItem(chart.config.options.scales.x.min, data[scrollPoint].x)   
      }
    }
    if(drag.offsetX > x.getPixelForValue(chart.config.options.scales.x.min) + 11 && 
       drag.offsetX < x.getPixelForValue(chart.config.options.scales.x.max) - 11){
      
        canvas.onmousemove = (e) => {
        //let chart = lineRef.value.chartInstance;
        dragMoveCenter(chart, e);
      }

      function dragMoveCenter(chart, dragDelta){

        console.log('center')
        const dragStartingPoint = x.getValueForPixel(drag.offsetX)
        const dayStartingPoint = new Date(dragStartingPoint).setHours(0, 0, 0, 0)
        let dragStart = data.findIndex(item => item.x == dayStartingPoint)

        // difference
        const timestamp = x.getValueForPixel(dragDelta.offsetX);
        const dayTimestamp = new Date(timestamp).setHours(0, 0, 0, 0)
        let scrollPoint = data.findIndex(item => item.x == dayTimestamp)

        let difference = scrollPoint - dragStart;
        
        let difference2 = 0;
        if(dragDelta.movementX > 0){
          difference2 = 1
        }
        if(dragDelta.movementX < 0){
          difference2 = -1
        }


        let min =  new Date(chart.config.options.scales.x.min).setHours(0, 0, 0, 0)
        let max = new Date(chart.config.options.scales.x.max).setHours(0, 0, 0, 0)
        console.log('chart min = ', new Date(min).toLocaleString())
        console.log('chart max = ', new Date(max).toLocaleString())

        let minIndex = data.findIndex(item => item.x === min)
        let maxIndex = data.findIndex(item => item.x === max)

        let minChart1;
        console.log('diference>', difference2)
        console.log('min index point>', minIndex)
        console.log('max index point>', maxIndex)
        
        if (data[minIndex + difference] === undefined){
          minChart1 = data[0].x
        } else{
          minChart1 = data[minIndex + difference].x
        } 
        
        let maxChart1;
        if (data[maxIndex + difference] === undefined){
          maxChart1 = data[data.length -1].x
        } else {
          maxChart1 = data[maxIndex + difference].x
        }

        console.log('minChart1 = ', new Date(minChart1).toLocaleString())
        console.log('maxChart1 = ', new Date(maxChart1).toLocaleString())

        if (minChart1 === data[0].x){
          chart.config.options.scales.x.min = data[0].x
          chart.config.options.scales.x.max = chart.config.options.scales.x.max
          console.log('drag left')
        } else if(minChart1 === data[data.length - 1].x){
          chart.config.options.scales.x.min = chart.config.options.scales.x.min
          chart.config.options.scales.x.max = data[data.length - 1].x
          console.log('drag right')
        } else if(minChart1 >= data[0].x  &&  chart.config.options.scales.x.max <=  data[data.length - 1].x){
         chart.config.options.scales.x.min = minChart1;
         chart.config.options.scales.x.max = maxChart1;
          console.log('drag')
        }

    
        console.log('after min =>', new Date(chart.config.options.scales.x.min).toLocaleString());
        console.log('after max =>', new Date(chart.config.options.scales.x.max).toLocaleString());  
       
        chart.update('none')
        smallChart.update('none')
        zoomBoxItem(minChart1, maxChart1)

      }
    }
  }
}
window.addEventListener('resize', (e) => {
  let chart = lineRef.value.chartInstance;
  let smallChart = smallLineRef.value.chartInstance;
  smallChart.resize();

  zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max )
})

let smallChartOptions = computed(()=>{
    return {
      animation: false,
      layout:{
        padding:{
         left: 0,
         right: 0
        }
      }, 
     
     plugins: {  
      rectangel: false,
      crosshairLabel: false,

       legend: {
         display:false,
         labels: {
           display:false,
           usePointStyle: false,
         },
       },
       tooltip:{
              enabled: false
        },
     }, 
     scales: {
       x: {
        min: +data[0].x,
         // max: +data[data.length-1].x,
         type: 'time',       
         time: {
           unit: 'day',
           displayFormats: {
             minute:'HH:mm',
             hour: 'HH:mm',
             day: 'dd.MM',
             week:'dd.MM.yy',
           }
         },
       },
       'leftyaxis': {
        display: false,
         type: 'linear',
         position: 'left',
         title: {text:"-",display: true},
         min: 0
       },
     }  
   }   
 })

  const smallChartData = computed(()=>{
      return {
      datasets: [{
        label:"Hashrate",
        borderColor: '#0068dd',
        backgroundColor: '#0068dd',
        cubicInterpolationMode: 'monotone',
        pointRadius: 0,
        yAxisID: 'leftyaxis',
        hidden: false,
        pointRadius:0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        data: null,
      }] 
    }
  })
</script>
<style scoped>
.smallChart{
  height: 100px;
}
</style>

 
 <!-- Add "scoped" attribute to limit CSS to this component only -->


