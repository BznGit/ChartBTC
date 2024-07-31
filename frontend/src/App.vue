<script setup>
  import Header from './components/Header.vue'
  import Chart from './components/Chart.vue'
</script>

<template>
  <Header/>
  <div class="chart" @logined="logined">
    <Chart/>
  </div>
</template>

