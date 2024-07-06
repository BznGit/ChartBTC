
<template>
  <div class="menu">
    <div class="menu-inputs">
      <select v-model="selected">
     
        <option value='equals'>=</option>
        <option value='increment'>+</option>
        <option value='decrement'>-</option>
      </select>
      <input type="number"  v-model="hightlightHashrate">
      <button @click="setHightlightHashrate">ok</button>
      client
    </div>
    <div class="zoom-items">
     
      <input type="radio" id="day" v-model="division" value="day" />
      <label for="day" class="checked">День</label>
      <input type="radio" id="week" v-model="division" value="week" />  
      <label for="week">Неделя</label> 
      <input type="radio" id="month" v-model="division" value="month" />
      <label for="month">Месяц</label> 
      <input type="radio" id="all" v-model="division" value="year" />
      <label for="all">Все</label>   
    </div>  
  </div>
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
  import { useStore } from '../store/store'

  const lineRef = ref()
  const hightlightHashrate = ref() 
  const selected = ref('equals')
  const division = ref('year')
  const loading = ref(false)
  const dataChanged = ref(false)
  const step = ref()
  let changedPointsArr = ref([])
  const store = useStore();

  // Resolving anchors "day", "week", "month", "all" ------------------------------------------/
  watch(division, (newDevision, oldDivision) => {
    let chart = lineRef.value.chartInstance;
    let smallChart = smallLineRef.value.chartInstance;
    let period = null;

    switch(newDevision){
      case 'day': period = 7;
        break;
      case 'week': period = 30;
        break; 
      case 'month': period = 90;
        break; 
      case 'year': period = 365; // -> 'all'
        break; 
    }
    let end = null
    let start  =  null; 
    if(period === 365){
      start = smallChart.data.datasets[0].data[0].x;
      end =  smallChart.data.datasets[0].data[smallChart.data.datasets[0].data.length - 1].x;
    } else{
      
      let index = findClosestNumber(smallChart.data.datasets[0].data, chart.data.datasets[0].data[0].x);
      start = smallChart.data.datasets[0].data[index].x;
      let curr = new Date(start);
      curr.setDate(curr.getDate() + period);
      index = findClosestNumber(smallChart.data.datasets[0].data, +curr);
      end = smallChart.data.datasets[0].data[index].x
    }
    startFetch(start, end)
    
  })

  
  const props = defineProps({
     idChart: Number,
     from: String, 
     data: Object,
     koef: String
   })

  
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

  // ============================= API REQWESTS ============================= //


  let k = 0
  function startFetch(min, max){
    const data = store.startFetch(min, max)
    updateChart(data, false)
  }

  function updateData(){
    store.updateData( changedPointsArr.value)
  }


  // Update chart ------------------------------------------------------ 
  function updateChart(allData, def){
   // console.log(allData)
    let data = allData.chart;
    let data1 = allData.smallChart;
    step.value = allData.step
    dataset1.value.data = data
    let chart = lineRef.value.chartInstance;
    let smallChart = smallLineRef.value.chartInstance;
   
    chart.data.datasets[0].data = allData.chart;

    for(let i=0; i < data.length; i++){
      dataset1.value.pointBorderColor.push('#0068dd');
      dataset1.value.backgroundColor.push('#0068dd');
    }
  
    chart.config.options.scales.x.min = data[0].x;
    chart.config.options.scales.x.max = data[data.length - 1].x;

    let min = data.reduce((prev,cur) => cur.y < prev.y? cur : prev);
    let max = data.reduce((prev,cur) => cur.y > prev.y? cur : prev);
    chart.config.options.scales['leftyaxis'].min = min.y - min.y*0.1;
    chart.config.options.scales['leftyaxis'].max = max.y + max.y*0.1;

    //chart.config.options.plugins.zoom.limits.x.min = data[0].x;
   // chart.config.options.plugins.zoom.limits.x.max = data[data.length - 1].x

   // chart.config.options.scales.x.min = data[0].x;
   // chart.config.options.scales.x.max = data[data.length - 1].x;
 

    smallChart.config.options.layout.padding.left =  chart.chartArea.left - chart.config.options.layout.padding.left
    smallChart.config.options.layout.padding.right = chart.width - chart.chartArea.right

    smallChart.data.datasets[0].data =  data1
    smallChart.config.options.scales.x.min = data1[0].x;
    smallChart.config.options.scales.x.max = data1[data1.length - 1].x;

    min = data.reduce((prev,cur) => cur.y < prev.y? cur : prev);
    max = data.reduce((prev,cur) => cur.y > prev.y? cur : prev);
    
    smallChart.config.options.scales['leftyaxis'].min = min.y - min.y*0.1;
    smallChart.config.options.scales['leftyaxis'].max = max.y + max.y*0.1;

    
    min = smallChart.data.datasets[0].data.reduce((prev,cur) => cur.y < prev.y? cur : prev);
    max = smallChart.data.datasets[0].data.reduce((prev,cur) => cur.y > prev.y? cur : prev);
    smallChart.config.options.scales['leftyaxis'].min = min.y - min.y*0.1;
    smallChart.config.options.scales['leftyaxis'].max = max.y + max.y*0.1;
    chart.stop();
    smallChart.update()
    chart.update()
    
    zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max) 
  }

  let mainMin = 0;
  let mainMax = 0;

  onMounted(() => {
    let smallChart = smallLineRef.value.chartInstance;

    smallChart.canvas.onmouseup = ()=>{
      smallChart.stop();
      smallChart.update('none')
      startFetch(mainMin, mainMax)
    }
    const data = store.getChart
    updateChart(data, true)
  });

  function setHightlightHashrate(event){
    if(highlighArrIndex.length==0) return
    let chart = lineRef.value.chartInstance
    let smallChart = smallLineRef.value.chartInstance
    highlighArrIndex.forEach(index=>{
      if(selected.value === 'equals'){
        chart.data.datasets[0].data[index].y =  parseFloat(hightlightHashrate.value)
        smallChart.data.datasets[0].data [index].y = parseFloat(hightlightHashrate.value)
      }
      if(selected.value === 'increment'){
        chart.data.datasets[0].data[index].y = chart.data.datasets[0].data[index].y + parseFloat(hightlightHashrate.value)
        smallChart.data.datasets[0].data [index].y = smallChart.data.datasets[0].data [index].y + parseFloat(hightlightHashrate.value)
      }
      if(selected.value === 'decrement'){
        chart.data.datasets[0].data[index].y = chart.data.datasets[0].data[index].y - parseFloat(hightlightHashrate.value)
        smallChart.data.datasets[0].data [index].y = smallChart.data.datasets[0].data [index].y - parseFloat(hightlightHashrate.value)
      }
      let indexNear  = findClosestNumber(smallChart.data.datasets[0].data, chart.data.datasets[0].data[index].x) 
      changedPointsArr.value.push(smallChart.data.datasets[0].data[indexNear])
    })
  
    let min = chart.data.datasets[0].data.reduce((prev,cur) => cur.y < prev.y? cur : prev);
    let max = chart.data.datasets[0].data.reduce((prev,cur) => cur.y > prev.y? cur : prev);
    chart.config.options.scales['leftyaxis'].min = min.y - min.y*0.1;
    chart.config.options.scales['leftyaxis'].max = max.y + max.y*0.1;

    min = smallChart.data.datasets[0].data.reduce((prev,cur) => cur.y < prev.y? cur : prev);
    max = smallChart.data.datasets[0].data.reduce((prev,cur) => cur.y > prev.y? cur : prev);
    smallChart.config.options.scales['leftyaxis'].min = min.y - min.y*0.01;
    smallChart.config.options.scales['leftyaxis'].max = max.y + max.y*0.01;
    if(highlighArrIndex.length!=0){
           
           highlighArrIndex.forEach(index=>{
             chart.data.datasets[0].pointBorderColor[index] = '#0068dd'
             chart.data.datasets[0].backgroundColor[index] = '#0068dd'
             highlighArrIndex = []
           })
           chart.update()
         } 
    chart.update()  
    smallChart.update('none')
    zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max)

    updateData()   
  }

  let highlighArrIndex = [];
  function highlightDatasetsPoints(setData){
    highlighArrIndex = []
    let chart = lineRef.value.chartInstance;
    highlighArrIndex = [];
    chart.data.datasets[0].data.forEach((item, index)=>{
      if(((+setData.startX < +item.x &&  +item.x < +setData.endX) || (+setData.startX > +item.x &&  +item.x > +setData.endX))
      && ((+setData.startY < +item.y &&  +item.y < +setData.endY) || (+setData.startY > +item.y &&  +item.y > +setData.endY)))
        highlighArrIndex.push(index)
    })
    console.log(highlighArrIndex.length)
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
    
      ctx.lineWidth = 2;
      ctx.fillStyle = 'red';
      ctx.setLineDash([0, 0])
      let add = 0
      if(!tooltip) return
      let centrX = tooltip.chart.chartArea.left + tooltip.chart.chartArea.width / 2;
      if(tooltip.xAlign =='left') add = 0
      if(tooltip.xAlign =='right') add =  0
      if( x > centrX-5 && tooltip.xAlign =='left'){
      add = -(tooltip.width + 0 ); 

    } 
 
      ctx.beginPath();
      ctx.strokeStyle = '#0068dd';
      ctx.arc(x + add, y, 6, 0, Math.PI / 180 * 360);
      //ctx.fillStyle = "red";
    
      ctx.fill();
      ctx.closePath();
      ctx.stroke()
    }
  }

  Chart.register(plugin, crosshairLabel, rectangel, zoomPlugin, ...registerables);

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
      animation: false,
     interaction: {
       mode: 'index',
       intersect: true,
     },
     hover: {
            intersect: true,
            mode: 'dataset',
        },
        onHover: function(e) {
            const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)
            
            if (point.length){
              e.native.target.style.cursor = 'grab';
              point[0].element.options.radius = 4
            } 
            else {
              e.native.target.style.cursor = 'crosshair'
            }

          },
     plugins: {
      zoom: {
        limits:{
          x:{}, 
          
        },
         zoom: {
          animation: {
          duration: 100
        },
         
          onZoom: ()=>{
          //  let chart = lineRef.value.chartInstance;
          //  zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max )
          },
          onZoomComplete: ()=>{
            let smallChart = smallLineRef.value.chartInstance;
            let chart = lineRef.value.chartInstance;
            const min = findClosestNumber(smallChart.data.datasets[0].data, new Date(chart.config.options.scales.x.min).setHours(0, 0, 0, 0));
            const max = findClosestNumber(smallChart.data.datasets[0].data, new Date(chart.config.options.scales.x.max).setHours(0, 0, 0, 0));
  
            startFetch(smallChart.data.datasets[0].data[min].x, smallChart.data.datasets[0].data[max].x)
            chart.stop();
            smallChart.stop();
            chart.update();
            smallChart.update('none');
            
            zoomBox(smallChart.data.datasets[0].data[min].x, smallChart.data.datasets[0].data[max].x)
      

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
            hightlightHashrate.value = value.y
            if (highlighArrIndex.length ==0) highlighArrIndex.push(index)
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
               // chart.config.options.scales['leftyaxis'].max = value.y + value.y*0.1;
             
                changedPointsArr.value =[]
                console.log(new Date(chart.data.datasets[datasetIndex].data[highlighArrIndex[0]].x))

                highlighArrIndex.forEach(index1=>{
                  let indexNear  = findClosestNumber(smallChart.data.datasets[datasetIndex].data, chart.data.datasets[datasetIndex].data[index1].x) 
                  if(selected.value === 'equals'){
                    console.log(index1, indexNear)
                    chart.data.datasets[datasetIndex].data[index1].y = value.y
                    smallChart.data.datasets[datasetIndex].data[indexNear].y = value.y;
                  }
                  if(selected.value === 'increment'){
                    chart.data.datasets[datasetIndex].data[index1].y = chart.data.datasets[datasetIndex].data[index1].y + 1
                    smallChart.data.datasets[datasetIndex].data[indexNear].y =smallChart.data.datasets[datasetIndex].data[indexNear].y + 1
                  }
                  if(selected.value === 'decrement'){
                    chart.data.datasets[datasetIndex].data[index1].y = chart.data.datasets[datasetIndex].data[index1].y - 1
                    smallChart.data.datasets[datasetIndex].data[indexNear].y =smallChart.data.datasets[datasetIndex].data[indexNear].y - 1;
                  }
                  changedPointsArr.value.push(smallChart.data.datasets[datasetIndex].data[indexNear])
                })
                let lim = 1;
                console.log(new Date(changedPointsArr.value[0].x))
                // Set scales max/min Chart -----------------------------
                let arr = chart.config.data.datasets[datasetIndex].data
                let max = arr.reduce((prev,cur) => cur.y > prev.y? cur : prev);
                let min = arr.reduce((prev,cur) => cur.y < prev.y? cur : prev);
          
                chart.config.options.scales['leftyaxis'].max = max.y + lim
                chart.config.options.scales['leftyaxis'].min = (min.y - lim) < 0? 0 : (min.y - lim)
                // Set scales max/min smallChart -------------------------
                arr = smallChart.config.data.datasets[datasetIndex].data
                max = arr.reduce((prev,cur) => cur.y > prev.y? cur : prev);
                min = arr.reduce((prev,cur) => cur.y < prev.y? cur : prev);
                smallChart.config.options.scales['leftyaxis'].max = max.y + lim
                smallChart.config.options.scales['leftyaxis'].min = (min.y - lim) < 0? 0 : (min.y - lim)

                chart.update('none')
                smallChart.update('none')
                zoomBox(chart.config.options.scales.x.min, chart.config.options.scales.x.max )
              }
            }
          },
          onDragEnd: function (e, datasetIndex, index, value) {
            console.log('drag end!')
            dataChanged.value = true;
            updateData()
            changedPointsArr.value =[]
       
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
        caretPadding: 20,
        enabled: true,
        intersect: false,
        usePointStyle: false,
        callbacks: {
          labelPointStyle: function(context) {
            return {
              pointStyle: 'circule',
              rotation: 0
            }
          },
          usePointStyle: function(context) {
                        return {
                          backgroundColor: 'red',
                           pointStyle: 'circule',
                        }
                      },
          label: function(tooltipItems) {
              return 'Hashrate: '  + tooltipItems.parsed.y + ' ' + props.koef;
          },

        }
      }
     }, 
     scales: {
       x: {
         type: 'time',       
         time: {
           unit: division.value,
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
        // min: 0
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
        const timestamp = x.getValueForPixel(dragDelta.offsetX);
        const dayTimestamp = new Date(timestamp).setHours(0, 0, 0, 0)
        let scrollPoint = findClosestNumber(smallChart.data.datasets[0].data, dayTimestamp)
        
    
        if(dragDelta.offsetX < left && scrollPoint === -1) scrollPoint = 0; 
        if(dragDelta.offsetX > right && scrollPoint === -1){
          scrollPoint = findClosestNumber(smallChart.data.datasets[0].data, new Date(chart.config.options.scales.x.max).setHours(0, 0, 0, 0)) - 1;
        } 
        if(scrollPoint > findClosestNumber(smallChart.data.datasets[0].data, new Date(chart.config.options.scales.x.max).setHours(0, 0, 0, 0)) - 1) {
          scrollPoint = findClosestNumber(smallChart.data.datasets[0].data, new Date(chart.config.options.scales.x.max).setHours(0, 0, 0, 0)) - 1
        }

        let x1 =  smallChart.data.datasets[0].data[scrollPoint].x

        chart.config.options.scales.x.min = x1
        chart.stop();
        smallChart.stop();
        chart.update('none');
        smallChart.update('none');
       // startFetch(x1, chart.config.options.scales.x.max)
        mainMin  = x1;
        mainMax = chart.config.options.scales.x.max;
        zoomBoxItem(x1, chart.config.options.scales.x.max)
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
       
        let scrollPoint = findClosestNumber(smallChart.data.datasets[0].data, dayTimestamp)
  
        if(dragDelta.offsetX > right && scrollPoint === -1) {
          scrollPoint = smallChart.data.datasets[0].data.length - 1; 
          onsole.log('here1>')
        }
        if(dragDelta.offsetX < left && scrollPoint === -1){
          onsole.log('here2>')
          scrollPoint = findClosestNumber(smallChart.data.datasets[0].data, new Date(chart.config.options.scales.x.min).setHours(0, 0, 0, 0) ) + 1;
        } 
        if(scrollPoint!=-1 && scrollPoint < findClosestNumber(smallChart.data.datasets[0].data, new Date(chart.config.options.scales.x.min).setHours(0, 0, 0, 0)) + 1 ) {
          scrollPoint = findClosestNumber(smallChart.data.datasets[0].data,  new Date(chart.config.options.scales.x.min).setHours(0, 0, 0, 0)) + 1
        }

        chart.config.options.scales.x.max = smallChart.data.datasets[0].data[scrollPoint].x
        chart.stop();
        smallChart.stop();
        chart.update('none');
        smallChart.update('none')
      // startFetch(chart.config.options.scales.x.min, smallChart.data.datasets[0].data[scrollPoint].x)
        mainMin  = chart.config.options.scales.x.min;
       mainMax = smallChart.data.datasets[0].data[scrollPoint].x;
        zoomBoxItem(chart.config.options.scales.x.min, smallChart.data.datasets[0].data[scrollPoint].x)   
      }
    }
    if(drag.offsetX > x.getPixelForValue(chart.config.options.scales.x.min) + 11 && 
       drag.offsetX < x.getPixelForValue(chart.config.options.scales.x.max) - 11){
      
        canvas.onmousemove = (e) => {
        //let chart = lineRef.value.chartInstance;
        dragMoveCenter(chart, e, new Date(minChart1).setHours(0, 0, 0, 0), new Date(maxChart1).setHours(0, 0, 0, 0));
      }
      let oldScrollPoint = 0
      function dragMoveCenter(chart, dragDelta, staticScaleMin, staticScaleMax){

        // difference
        const dragStartingPoint = x.getValueForPixel(drag.offsetX)
        const dayStartingPoint = new Date(dragStartingPoint).setHours(0, 0, 0, 0);
        let dragStart = findClosestNumber(smallChart.data.datasets[0].data, dayStartingPoint);
        const timestamp = x.getValueForPixel(dragDelta.offsetX);
        const dayTimestamp = new Date(timestamp).setHours(0, 0, 0, 0);
     
        let scrollPoint = findClosestNumber(smallChart.data.datasets[0].data, dayTimestamp)
       // if(scrollPoint ===-1) scrollPoint = oldScrollPoint; else oldScrollPoint = scrollPoint
        

        let difference = scrollPoint - dragStart;

        if (scrollPoint === -1 && dragDelta.offsetX >= right){
          scrollPoint = smallChart.data.datasets[0].data.length - 1;
        };

        const range = findClosestNumber(smallChart.data.datasets[0].data, staticScaleMax) - findClosestNumber(smallChart.data.datasets[0].data, staticScaleMin)
        
        const minVal = findClosestNumber(smallChart.data.datasets[0].data, staticScaleMax) + difference - range; // 0
        const maxVal = findClosestNumber(smallChart.data.datasets[0].data, staticScaleMax) + difference; // 0
       
        let minChart1;
        let maxChart1;
   
        if (minVal < 0 ){
          minChart1 = smallChart.data.datasets[0].data[0].x;
          maxChart1 = smallChart.data.datasets[0].data[range].x ;
             
        } else if (maxVal >= smallChart.data.datasets[0].data.length - 1 || difference < 0 && dragDelta.offsetX >= right ){
          minChart1 = smallChart.data.datasets[0].data[smallChart.data.datasets[0].data.length - 1 - range].x ;
          maxChart1 = smallChart.data.datasets[0].data[smallChart.data.datasets[0].data.length - 1].x;
        } else {
          maxChart1 = smallChart.data.datasets[0].data[findClosestNumber(smallChart.data.datasets[0].data, staticScaleMax) + difference].x;
          minChart1 = smallChart.data.datasets[0].data[findClosestNumber(smallChart.data.datasets[0].data, staticScaleMin) + difference].x;
        }

        if(minChart1 === smallChart.data.datasets[0].data[0].x){
          chart.config.options.scales.x.min =smallChart.data.datasets[0].data[0].x
          chart.config.options.scales.x.max = chart.config.options.scales.x.max
        } else  if(maxChart1 === smallChart.data.datasets[0].data[smallChart.data.datasets[0].data.length - 1].x ){
          chart.config.options.scales.x.min = chart.config.options.scales.x.min
          chart.config.options.scales.x.max = smallChart.data.datasets[0].data[smallChart.data.datasets[0].data.length - 1].x
        } else if(chart.config.options.scales.x.min >= smallChart.data.datasets[0].data[0].x   &&  chart.config.options.scales.x.max <=  smallChart.data.datasets[0].data[smallChart.data.datasets[0].data.length - 1].x){
          chart.config.options.scales.x.min = minChart1;
          chart.config.options.scales.x.max = maxChart1;
        }
        
        chart.stop();
        smallChart.stop();
        chart.update('none');
        smallChart.update('none')
       // startFetch(minChart1, maxChart1)
        mainMin = minChart1
        mainMax= maxChart1
        zoomBoxItem(minChart1, maxChart1)

      }
    }
  }
}

function findClosestNumber(arr, target) {
  let closest = arr[0];
  let minDifference = Math.abs(target - arr[0].x);

  for (let i = 1; i < arr.length; i++) {
    let difference = Math.abs(target - arr[i].x);
    if (difference < minDifference) {
      minDifference = difference;
      closest = arr[i];
    }
  }
  const index = arr.indexOf(closest)
  return index
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
           unit: 'year',
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


