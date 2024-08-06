import { defineStore } from 'pinia';
import  defaultDataClass  from './defaultDataClass.js';
import  { saveChartsData }  from '../api/index.js'

const data = new defaultDataClass();

export const useStore = defineStore('arrdays', {
    state: () => ({
        currUser: true,
        arrDays: data.setData(),
        arrDaysHist: data.setDataHist()
            
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
        async saveChart(){
            const save = await saveChartsData(this.arrDays)
            return save
        },
        setCurrUser(bool){
            this.currUser = bool
        },
        setSavedData(arr){
            this.arrDays = arr
        }
       
    },
    getters: {
        getChart(){
            const { chart, step } = data.getSmallChatData(this.arrDays)
            this.step = step
            return {
                smallChart: chart,
                chart: chart
            }
        },
        getCurrUser(){
            return this.currUser
       }

    },
});

