import { defineStore } from 'pinia';
import  defaultData  from './utils.js';
import  { ref }  from 'vue';

const data = new defaultData();

export const useStore = defineStore('arrdays', {
    state: () => ({
      arrDays: data.setData(),
      
    }),
  
    actions: {
        updateData(arr, selected) {
            const chart = data.updateData(arr, this.arrDays, this.step, selected)
            this.$reset()
            this.arrDays = chart
    
        },
        startFetch(min, max){
        
            const chart = data.fetchData(min, max, this.arrDays)
            this.step = chart.step
            return chart
        }, 
       
    },
    getters: {
        getChart(){
            const {chart, step } = data.getSmallChatData(this.arrDays)
            this.step = step
            return {
                smallChart: chart,
                chart: chart
            }
       },

    },
});

