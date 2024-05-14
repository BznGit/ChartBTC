
<template>
  <LineChart ref="lineRef":chartData="chartData" :options="chartOptions"/>
 </template>
 <script setup>
  import { LineChart } from "vue-chart-3";
  import { Chart, registerables } from "chart.js";

  import { ref,  onMounted, computed, watch, onUpdated } from 'vue';
  import 'chartjs-adapter-date-fns';
  import 'chartjs-plugin-dragdata'
  const lineRef = ref()
  onMounted(() => {
      console.log(lineRef.value.chartInstance);
      lineRef.value.chartInstance.toBase64Image();
      
    });
    function handleChartRender(chart) {
      console.log(chart);
    }
    handleChartRender
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
   Chart.register(plugin, ...registerables);
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
            console.log("drag start!");
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
            console.log("drag!");
            /*     
          // you may control the range in which datapoints are allowed to be
          // dragged by returning `false` in this callback
          if (value < 0) return false // this only allows positive values
          if (datasetIndex === 0 && index === 0 && value > 20) return false 
          */
          },
          onDragEnd: function (e, datasetIndex, index, value) {
            console.log("drag end!");
            // you may use this callback to store the final datapoint value
            // (after dragging) in a database, or update other UI elements that
            // dependent on it
          },
        },

        plugin: {
          line:{
           dash: [ 1, 2 ],
           color: 'blue',
           width: 2
         }
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
       'left-y-axis': {
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
       {
         label:"Hashrate",
         borderColor: '#0068dd',
         backgroundColor: '#0068dd',
         cubicInterpolationMode: 'monotone',
         pointRadius: 3,
         yAxisID: 'left-y-axis',
         hidden: false,
         dragData: true,
         pointHoverRadius: 4,
         spanGaps: true,
         data: [{x: new Date(2023, 10), y: 11}, {x: new Date(2023, 11), y: 15}, {x: new Date(2024, 0), y: 15}]//props.data
       }
     ] 
   }
 })

  
 </script>

 
 <!-- Add "scoped" attribute to limit CSS to this component only -->


