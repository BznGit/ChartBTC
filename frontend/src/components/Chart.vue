
<template>
  <input type="number"  @input="setHightlightHashrate" v-model="hightlightHashrate">
  <LineChart ref="lineRef" :chartData="chartData" :options="chartOptions"  />
  <LineChart class= "smallChart"  ref="smallLineRef" :chartData="smallChartData" :options="smallChartOptions"  />
  <span>{{ date1 }} - {{ date2 }}</span>
</template>
 <script setup>
  import { LineChart } from "vue-chart-3";
  import { Chart, Tooltip, registerables } from "chart.js";
  import { ref, reactive,   onMounted, computed, watch, onUpdated, defineCustomElement } from 'vue';
  import 'chartjs-adapter-date-fns';
  import 'chartjs-plugin-dragdata'
  import zoomPlugin from 'chartjs-plugin-zoom';

  Tooltip.positioners.myCustomPositioner = function(elements, eventPosition) {
    // A reference to the tooltip model
    const tooltip = this;
    if (elements.length == 0) return {
      x: 0,
      y: 0
    }
    let centrX = tooltip.chart.chartArea.left + tooltip.chart.chartArea.width / 2;
    let add = 0; 
    if( elements[0].element.x > centrX) add = -20; 
    if( elements[0].element.x < centrX) add = 20; 
    if( elements[0].element.x == centrX){
      add = -(tooltip.width + 30); 
      tooltip.xAlign = 'right'
    } 
    return {
      x: elements[0].element.x + add,
      y: elements[0].element.y,
      // You may also include xAlign and yAlign to override those tooltip options.
    };
  };
  const props = defineProps({
     idChart: Number,
     from: String, 
     data: Object,
     koef: String
   })
  const lineRef = ref()
  const hightlightHashrate = ref() 
  let dataset1 =  ref( {
         label:"Hashrate",
         borderColor: '#0068dd',
         backgroundColor: '#0068dd',
         cubicInterpolationMode: 'monotone',
         pointRadius: 4,
         yAxisID: 'leftyaxis',
         hidden: false,
         dragData: true,
         pointHoverRadius: 4,
         spanGaps: true,
         data: null,
         pointBorderColor:[],
         backgroundColor:[]

       })

  onMounted(() => {
    const width = window.screen.width;
    const timeZone = new Date().getTimezoneOffset();
    console.log(typeof width)
    fetch(`/chart?width=${width}&timezone=${timeZone}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    }).then(res =>  res.json())
    .then(function(data){
        //console.log(data)
        dataset1.value.data = data
        
        let chart = lineRef.value.chartInstance;
        let smallChart = smallLineRef.value.chartInstance;
        
        chart.data.datasets[0].data = data;

        for(let i=0; i<data.length; i++){
          dataset1.value.pointBorderColor.push('#0068dd');
          dataset1.value.backgroundColor.push('#0068dd');
        }
      
        chart.config.options.scales.x.min = data[0].x;
        chart.config.options.scales.x.max = data[data.length - 1].x;

        let min = data.reduce((prev,cur) => cur.y < prev.y? cur : prev);
        let max = data.reduce((prev,cur) => cur.y > prev.y? cur : prev);
        chart.config.options.scales['leftyaxis'].min = min.y - min.y*0.1;
        chart.config.options.scales['leftyaxis'].max = max.y + max.y*0.1;

        chart.config.options.plugins.zoom.limits.x.min = data[0].x;
        chart.config.options.plugins.zoom.limits.x.max = data[data.length - 1].x

        chart.config.options.scales.x.min = data[0].x;
        chart.config.options.scales.x.max = data[data.length - 1].x;

        smallChart.config.options.layout.padding.left =  chart.chartArea.left - chart.config.options.layout.padding.left
        smallChart.config.options.layout.padding.right = chart.width - chart.chartArea.right
        smallChart.data.datasets[0].data =  data
        console.log(data)
        smallChart.update('none')
        chart.update()
        
        zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max) 
    });


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
      const {ctx, canvas, chartArea:  {left, right, top, bottom}, scales: {x, leftyaxis}}  = chart;  


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
        ctx.fillStyle = 'grey';
        const textWidthX = ctx.measureText(new Date(x.getValueForPixel(crosshair[1].startX)).toDateString()).width ;
        const textWidthY = ctx.measureText(leftyaxis.getValueForPixel(crosshair[0].startY).toFixed(2)).width - 20;
        ctx.fillRect(0 - textWidthY, crosshair[0].startY - 10, left + textWidthY, 20);
        ctx.fillRect(crosshair[1].startX - (textWidthX/2), bottom, textWidthX, 25);
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom'
        ctx.fillStyle = 'white';
        ctx.fillText(leftyaxis.getValueForPixel(crosshair[0].startY).toFixed(2), left / 2 , crosshair[0].startY + 7)
        ctx.fillText(new Date(x.getValueForPixel(crosshair[1].startX)).toLocaleDateString(), crosshair[1].startX, bottom + 20)


        
      }
    },
    // mouse move
    afterEvent(chart, args){
      const {ctx, canvas, chartArea:  {left, right, top, bottom} }  = chart;
      const xCoor = args.event.x;
      const yCoor = args.event.y;
      
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
       intersect: true,
     },
     hover: {
            intersect: false,
            mode: 'dataset',
        },
        onHover: function(e) {
            const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
            
            if (point.length){
              e.native.target.style.cursor = 'grab';
             // console.log(point[0].element.options.radius)
              point[0].element.options.radius = 4
            } 
            else {
              e.native.target.style.cursor = 'crosshair'
             // point[0].element.options.radius = 1
            }

          },
     plugins: {
      zoom: {
        limits:{
          x:{}, 
          
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
   
          round: 2, // rounds the values to n decimal places
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
                chart.config.options.scales['leftyaxis'].max = value.y + value.y*0.1;
                  highlighArrIndex.forEach(index1=>{
                  chart.data.datasets[datasetIndex].data[index1].y = value.y
                  smallChart.data.datasets[datasetIndex].data[index1].y = value.y;
                  let lim = 1;
                  let arr = chart.config.data.datasets[datasetIndex].data
                  let max = arr.reduce((prev,cur) => cur.y > prev.y? cur : prev);
                  let min = arr.reduce((prev,cur) => cur.y < prev.y? cur : prev);
            
                  chart.config.options.scales['leftyaxis'].max = max.y + lim
                  chart.config.options.scales['leftyaxis'].min = (min.y - lim) < 0? 0 : (min.y - lim)
                  
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
        position: 'myCustomPositioner',
        enabled: true,
        intersect: false,
        usePointStyle: true,
        callbacks: {
           labelPointStyle: function(context) {
           let a = context
            if(context){
              context.element.options.radius = 4
             // console.log(context.element.options.radius)
            } else {
              context.element.options.radius = 1
            }
             return {
               pointStyle: 'circule',
               rotation: 0, 
               radius: 10
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
      min = dataset1.value.data[0].x
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
      minChart1 =dataset1.value.data[0].x
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
   let maxChart1 = chart.config.options.scales.x.max;
    if (minChart1 === undefined || minChart1 === -1){
   //   minChart1 = data[0].x
    }
    if(drag.offsetX >= x.getPixelForValue(minChart1) - 10 && drag.offsetX <= x.getPixelForValue(chart.config.options.scales.x.min) + 10){
      canvas.onmousemove = (e) => {
       // let chart = lineRef.value.chartInstance;
        dragMove(chart, e);
      };

      // left button move -----------------------------------------------------------------------/
      function dragMove(chart, dragDelta){
        const timeZone = new Date().getTimezoneOffset()
        console.log(timeZone/60)
        const timestamp = x.getValueForPixel(dragDelta.offsetX);
        const dayTimestamp = new Date(timestamp).setHours(0, 0, 0, 0)
        let scrollPoint = dataset1.value.data.findIndex(item=>item.x === dayTimestamp)
        
        console.log('scrollPoint first>>', scrollPoint)
        console.log('data>>', new Date(dataset1.value.data[0].x).toLocaleDateString(),' | ', new Date(dayTimestamp).toLocaleDateString())
        console.log('data>>', dataset1.value.data[0].x, dayTimestamp)
        
        if(dragDelta.offsetX < left && scrollPoint === -1) scrollPoint = 0; 
        if(dragDelta.offsetX > right && scrollPoint === -1){
          scrollPoint = dataset1.value.data.findIndex((item) => item.x == new Date(chart.config.options.scales.x.max).setHours(0, 0, 0, 0)) - 1;
        } 
        if(scrollPoint > dataset1.value.data.findIndex(item => item.x == new Date(chart.config.options.scales.x.max).setHours(0, 0, 0, 0)) - 1) {
          scrollPoint = dataset1.value.data.findIndex(item => item.x == new Date(chart.config.options.scales.x.max).setHours(0, 0, 0, 0)) - 1
        }
        console.log( 'scrollPoint second ->', scrollPoint)
        console.log( 'left move ->', dataset1.value.data[scrollPoint].x)
        chart.config.options.scales.x.min = dataset1.value.data[scrollPoint].x
        chart.update('none')
        smallChart.update('none');
        zoomBoxItem(dataset1.value.data[scrollPoint].x, chart.config.options.scales.x.max)
      }
    };

    if(drag.offsetX >= x.getPixelForValue(chart.config.options.scales.x.max) - 10 &&
     drag.offsetX <= x.getPixelForValue(chart.config.options.scales.x.max) + 10){
      canvas.onmousemove = (e) => {
         dragMove(chart, e);
      }
      // right button move -----------------------------------------------------------------------/
      function dragMove(chart, dragDelta){
        const timestamp = x.getValueForPixel(dragDelta.offsetX);
        const dayTimestamp = new Date(timestamp).setHours(0, 0, 0, 0)
       
        let scrollPoint = dataset1.value.data.findIndex(item => item.x == dayTimestamp)
        console.log('rightscrollPoint> ', scrollPoint)

        if(dragDelta.offsetX > right && scrollPoint === -1) {
          scrollPoint = dataset1.value.data.length - 1; 
          onsole.log('here1>')
        }
        if(dragDelta.offsetX < left && scrollPoint === -1){
          onsole.log('here2>')
          scrollPoint = dataset1.value.data.findIndex(item => item.x ==  new Date(chart.config.options.scales.x.min).setHours(0, 0, 0, 0) ) + 1;
        } 
        if(scrollPoint!=-1 && scrollPoint < dataset1.value.data.findIndex(item => item.x ==  new Date(chart.config.options.scales.x.min).setHours(0, 0, 0, 0)) + 1 ) {
          scrollPoint = dataset1.value.data.findIndex(item => item.x ==  new Date(chart.config.options.scales.x.min).setHours(0, 0, 0, 0)) + 1
    
          console.log('here3>')
        }

        console.log( 'right move ->', dataset1.value.data[scrollPoint], scrollPoint)
        chart.config.options.scales.x.max = dataset1.value.data[scrollPoint].x
        chart.update('none')
        smallChart.update('none');
        zoomBoxItem(chart.config.options.scales.x.min, dataset1.value.data[scrollPoint].x)   
      }
    }
    if(drag.offsetX > x.getPixelForValue(chart.config.options.scales.x.min) + 11 && 
       drag.offsetX < x.getPixelForValue(chart.config.options.scales.x.max) - 11){
      
        canvas.onmousemove = (e) => {
        //let chart = lineRef.value.chartInstance;
        dragMoveCenter(chart, e, new Date(minChart1).setHours(0, 0, 0, 0), new Date(maxChart1).setHours(0, 0, 0, 0));
      }

      function dragMoveCenter(chart, dragDelta, staticScaleMin, staticScaleMax){

        console.log('center')

   
      /*  minChart1 = chart.config.options.scales.x.min + (x.getValueForPixel(dragDelta.offsetX) - x.getValueForPixel(drag.offsetX))
        maxChart1 = chart.config.options.scales.x.max + (x.getValueForPixel(dragDelta.offsetX) -  x.getValueForPixel(drag.offsetX))
        console.log(new Date(x.getValueForPixel(dragDelta.offsetX - drag.offsetX)))
        chart.config.options.scales.x.min = minChart1;
        chart.config.options.scales.x.max = maxChart1;*/
        // difference
         const dragStartingPoint = x.getValueForPixel(drag.offsetX)
        const dayStartingPoint = new Date(dragStartingPoint).setHours(0, 0, 0, 0)
             let dragStart = dataset1.value.data.findIndex(item => item.x == dayStartingPoint)
        const timestamp = x.getValueForPixel(dragDelta.offsetX);

       const dayTimestamp = new Date(timestamp).setHours(0, 0, 0, 0)
        let scrollPoint = dataset1.value.data.findIndex(item => item.x == dayTimestamp)

        let difference = scrollPoint - dragStart;

        if (scrollPoint === -1 && dragDelta.offsetX >= right){
          scrollPoint = dataset1.value.data.length - 1;
        };

        const range = dataset1.value.data.findIndex(item => item.x === staticScaleMax) - dataset1.value.data.findIndex(item => item.x === staticScaleMin)
        
        const minVal = dataset1.value.data.findIndex(item => item.x === staticScaleMax) + difference - range; // 0
        const maxVal = dataset1.value.data.findIndex(item => item.x === staticScaleMax) + difference; // 0
       
        let minChart1;
        let maxChart1;
        console.log(scrollPoint)
        if (minVal < 0 ){
          minChart1 = dataset1.value.data[0].x;
          maxChart1 = dataset1.value.data[range].x ;
             
        } else if (maxVal >= dataset1.value.data.length - 1 || difference < 0 && dragDelta.offsetX >= right ){
          minChart1 = dataset1.value.data[dataset1.value.data.length - 1 - range].x ;
          maxChart1 = dataset1.value.data[dataset1.value.data.length - 1].x;
        } else {
          maxChart1 = dataset1.value.data[dataset1.value.data.findIndex(item => item.x === staticScaleMax) + difference].x;
          minChart1 = dataset1.value.data[dataset1.value.data.findIndex(item => item.x === staticScaleMin) + difference].x;
        }

       if (minChart1 === dataset1.value.data[0].x  ){
          chart.config.options.scales.x.min =dataset1.value.data[0].x
          chart.config.options.scales.x.max = chart.config.options.scales.x.max
        } else  if(maxChart1 === dataset1.value.data[dataset1.value.data.length - 1].x ){
          chart.config.options.scales.x.min = chart.config.options.scales.x.min
          chart.config.options.scales.x.max = dataset1.value.data[dataset1.value.data.length - 1].x
        } else if(chart.config.options.scales.x.min >= dataset1.value.data[0].x   &&  chart.config.options.scales.x.max <=  dataset1.value.data[dataset1.value.data.length - 1].x){
          chart.config.options.scales.x.min = minChart1;
          chart.config.options.scales.x.max = maxChart1;
        }
        
        chart.update('none')
        smallChart.update('none')
        console.log('->')
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
       // min: +dataset1.value.data[0].x,
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


