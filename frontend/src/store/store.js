import { defineStore } from 'pinia';
import  defaultData  from './utils.js';
import  { ref }  from 'vue';

const data = new defaultData();

export const useStore = defineStore('arrdays', {
    state: () => ({
      arrDays: ref(data.setData()),
      
    }),
  
    actions: {
        updateData(arr) {
            const chart = data.updateData(arr, this.arrDays)
            this.$reset()
            this.arrDays = chart
    
        },
        startFetch(min, max){
        
            const chart = data.fetchData(min, max, this.arrDays)
            return chart
        }, 
       
    },
    getters: {
        getChart(){
            const chart = data.getSmallChatData(this.arrDays)
            return {
                smallChart: chart,
                chart: chart
            }
       },

    },
});

