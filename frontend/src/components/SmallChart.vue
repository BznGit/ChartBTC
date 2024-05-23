
<template>
  <LineChart class= "smallChart" ref="lineRef" :chartData="chartData" :options="chartOptions"  />
  <span>{{ date1 }} - {{ date2 }}</span>
</template>
 <script setup>
  import { LineChart, defineChartComponent } from "vue-chart-3";
  import { Chart, registerables } from "chart.js";
  import { ref, reactive,   onMounted, computed, watch, onUpdated, defineCustomElement, nextTick } from 'vue';
  import 'chartjs-adapter-date-fns';
  const lineRef = ref()
  const date1 = ref()
  const date2 = ref()
  const props = defineProps({
     idChart: Number,
     from: String, 
     data: Object,
     koef: String
   })
 
   onMounted(() => {

    let chart = lineRef.value.chartInstance;
    const {ctx, canvas, chartArea: { top, bottom, left, right, width, height }, scales: {x, y} } = chart; 
    chart.data.datasets[0].data[0].y = 2
   // zoomBoxProfit(chart)
    chart.update('none')
  
  });
  const plugin1 = {
    id: 'frame',
    afterDraw: (chart, args, options) => {
      zoomBoxProfit(chart)
    }
}

  function zoomBoxProfit(chart){
    const min = chart.scales.x.min;
    const max = chart.scales.x.max;

   date1.value = new Date(min).toLocaleDateString()
   date2.value = new Date(max).toLocaleDateString()

   zoomBoxItem(min, max)

   function  zoomBoxItem(min, max){
    let chart = lineRef.value.chartInstance;
    const {ctx, canvas, chartArea: { top, bottom, left, right, width, height }, scales: {x, y} } = chart; 

     ctx.save();
     ctx.beginPath();
     ctx.moveTo(x, top)
     ctx.lineTo(x, bottom)
     ctx.fillStyle = 'rgba(237, 171, 109, 0.4)';
     ctx.fillRect(x.getPixelForValue(min), top, x.getPixelForValue(max) - x.getPixelForValue(min),  height);
     ctx.lineWidth = 2;
     ctx.strokeStyle = '#FF5B00';
     ctx.strokeRect(x.getPixelForValue(min), top, x.getPixelForValue(max) - x.getPixelForValue(min),  height);
     chart.update()

   }

 }

  Chart.register(plugin1,...registerables);

  let chartOptions = computed(()=>{
    return {
      
      layout:{
        padding:{
          left: 52,
          right: 0
        }
      }, 
     maintainAspectRatio: false,
    
     interaction: {
       mode: 'index',
       intersect: false,
     },

     plugins: {  
      rectangel: false,
      crosshairLabel: false,

       legend: {
         display:false,
         labels: {
           display:true,
           usePointStyle: false,
         },
       },
       tooltip:{
              enabled: false
        },
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
        display: false,
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
         pointRadius:0,
         pointHoverRadius: 0,
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
<style scoped>
.smallChart{
  height: 100px;

}
</style>

 
 <!-- Add "scoped" attribute to limit CSS to this component only -->


