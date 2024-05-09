
<template>
  <Line :data="chartData" :options="chartOptions"/>
 </template>
 <script setup>
   import { Line } from 'vue-chartjs';
   import { ref,  computed, watch, onUpdated } from 'vue';
   import 'chartjs-adapter-date-fns';
   import { Chart as ChartJS,
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     Title,
     Tooltip,
     TimeScale,
     Legend } from 'chart.js'
  
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
   const props = defineProps({
     idChart: Number,
     from: String, 
     data: Object,
     koef: String
   })
   ChartJS.register(
     CategoryScale,
     LinearScale,
     PointElement,
     LineElement,
     Title,
     Tooltip,
     Legend, 
     TimeScale, 
     plugin, 
   )
 
  let chartOptions = computed(()=>{
    return {
     maintainAspectRatio: false,
     
     interaction: {
       mode: 'index',
       intersect: false,
     },
     plugins: {  
       plugin: {
         line:{
           dash: [1, 2],
           color: 'blue',
           width: 1
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
           unit: 'minute',
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
         pointRadius:0,
         yAxisID: 'left-y-axis',
         hidden: false,
         data: props.data
       }
     ] 
   }
 })
 
  
 </script>

 
 <!-- Add "scoped" attribute to limit CSS to this component only -->


