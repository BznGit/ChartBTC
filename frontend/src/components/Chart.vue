
<template>
  <LineChart ref="lineRef" :chartData="chartData" :options="chartOptions"  />
  <input type="number" :value="0" @input="setHightlightHashrate">
 </template>
 <script setup>
  import { LineChart } from "vue-chart-3";
  import { Chart, registerables } from "chart.js";
  import { ref, reactive,   onMounted, computed, watch, onUpdated, defineCustomElement } from 'vue';
  import 'chartjs-adapter-date-fns';
  import 'chartjs-plugin-dragdata'

  const lineRef = ref()
 
  onMounted(() => {
    lineRef.value.chartInstance.toBase64Image();
    let chart = lineRef.value.chartInstance
    const {ctx, canvas, chartArea: { top, bottom, left, right, width, height }, scales: {x, y} } = chart; 

  });

  function setHightlightHashrate(event){
    console.log(event.target.value)
    if(highlighArrIndex.length==0) return
    let chart = lineRef.value.chartInstance
    highlighArrIndex.forEach(index=>{
      chart.data.datasets[0].data[index].y = event.target.value

  })
  chart.update()  
  }
  let highlighArrIndex = [];
function highlightDatasetsPoints(setData){
  let chart = lineRef.value.chartInstance
  console.log(chart.data.datasets[0].data[0].x)
  console.log(chart.options.scales.leftyaxis.min)

  
  chart.data.datasets[0].data.forEach((item, index)=>{
    console.log(+item.x, index)
    if((+setData.startX < +item.x &&  +item.x < +setData.endX) ||
       (+setData.startX > +item.x &&  +item.x > +setData.endX))
     highlighArrIndex.push(index)
    console.log(highlighArrIndex)
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
        ctx.fillStyle = 'rgba(237, 171, 109, 0.4)';
           
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
          console.log('clivk')

          if(highlighArrIndex.length!=0){
           
            highlighArrIndex.forEach(index=>{
              chart.data.datasets[0].pointBorderColor[index] = 'blue'
              chart.data.datasets[0].backgroundColor[index] = 'blue'
              
              highlighArrIndex = []
            })
            console.log(chart)
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
        ctx.fillStyle = 'white';
        ctx.fillText(leftyaxis.getValueForPixel(crosshair[0].startY).toFixed(2), left / 2, crosshair[0].startY)
        ctx.fillText(new Date(x.getValueForPixel(crosshair[1].startX)).toDateString(), crosshair[1].startX, bottom + 10)
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
   Chart.register(crosshairLabel, rectangel, ...registerables);

   const props = defineProps({
     idChart: Number,
     from: String, 
     data: Object,
     koef: String
   })
 
  let chartOptions = computed(()=>{
    return {
      dragData: true,
      maintainAspectRatio: false,
     
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

      dragData: {
          round: 0, // rounds the values to n decimal places
          // in this case 1, e.g 0.1234 => 0.1)
          showTooltip: true, // show the tooltip while dragging [default = true]
          // dragX: true // also enable dragging along the x-axis.
          // this solely works for continous, numerical x-axis scales (no categories or dates)!
          onDragStart: function (e, element) {
      //      console.log("drag start!", element);
            /*
          // e = event, element = datapoint that was dragged
          // you may use this callback to prohibit dragging certain datapoints
          // by returning false in this callback
          if (element.datasetIndex === 0 && element.index === 0) {
            // this would prohibit dragging the first datapoint in the first
            // dataset entirely
            return false
          }
          */
          },
          onDrag: function (e, datasetIndex, index, value) {
            if (highlighArrIndex.length!=0){
              let chart = lineRef.value.chartInstance;
              console.log('index',index, value)
              let point = +value.x
              let left = +chart.data.datasets[datasetIndex].data[highlighArrIndex[0]].x;
              let right = +chart.data.datasets[datasetIndex].data[highlighArrIndex[highlighArrIndex.length-1]].x;
              console.log(left, '{', point,'}',right)
              if((left <= point &&  point <= right) ||
              (left >= point &&  point >= right)){
                console.log(point)
                highlighArrIndex.forEach(index1=>{
                  chart.data.datasets[datasetIndex].data[index1].y = value.y
                  console.log(+chart.data.datasets[datasetIndex].data[index1].x, '>>', value.y)
                })
                chart.update()
              }
            }
       
              
        //    console.log("drag!", datasetIndex, index, value);
            /*     
          // you may control the range in which datapoints are allowed to be
          // dragged by returning `false` in this callback
          if (value < 0) return false // this only allows positive values
          if (datasetIndex === 0 && index === 0 && value > 20) return false 
          */
          },
          onDragEnd: function (e, datasetIndex, index, value) {
        //    console.log("drag end!");
            // you may use this callback to store the final datapoint value
            // (after dragging) in a database, or update other UI elements that
            // dependent on it
          },
        },

       legend: {
         display:true,
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
         type: 'time',       
         time: {
           unit: 'month',
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
  {x: new Date(2023, 10), y: 11},
  {x: new Date(2023, 11), y: 12}, 
  {x: new Date(2024, 0),  y: 6 },
  {x: new Date(2024, 1),  y: 7 }, 
  {x: new Date(2024, 2),  y: 9 }, 
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
         backgroundColor: ['blue', 'blue','blue','blue','blue'],
         pointBorderColor: ['blue','blue','blue', 'blue','blue']
       })

 const chartData = computed(()=>{
 
     return {
     datasets: [
     dataset1.value
     ] 
   }
 })

  
 </script>

 
 <!-- Add "scoped" attribute to limit CSS to this component only -->


