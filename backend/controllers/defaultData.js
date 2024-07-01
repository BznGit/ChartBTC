const { options } = require("../routes/routes");

const defaultData = class {
    setData(timezone) {
        let currTimeZone = new Date().getTimezoneOffset();
        //console.log('->>',new Date (timezone).getHours(), new Date (currTimeZone).getHours())
        let hourDelta = (currTimeZone - timezone)/60*(-1); 

        let curr = new Date();
        let step = new Date();
        let start = new Date();

        // get days array ----------------------------------------------------------------/
        step.setDate(step.getDate() + 1);
        this.lengthDays = 1000;
        this.arrDays = [];
        let cur = +curr;
        let nw = +step;
        let delta = (nw-cur) 
        let y = 100;
        for (let i = 0; i < this.lengthDays; i++){
            y += 5 - Math.random() * 10;
            let obj = {
                x: new Date((+start + delta*i)).setHours(hourDelta, 0, 0, 0),
                y:  y
            }
            this.arrDays.push(obj) // -> to base
        }
        console.log('first')
    }

    getDefaultData(division, width, timezone, def){
        console.log(division, width, timezone, def)
        if(def) this.setData(timezone)
        return {smallChart: this.getSmallChatData(), chart: this.getSmallChatData()}

    }

    fetchData(min, max){
        console.log(min, max)
   
        const step = Math.max(1, Math.round((max - min) / 10000000000));
        const data = [];
        let i = 0;
        // -> from base
        while (i < this.arrDays.length && this.arrDays[i].x < min) {
            i++;
          }
        while (i < this.arrDays.length && this.arrDays[i].x <= max) {
            data.push(this.arrDays[i]);
            i += step;
        }

        return {smallChart: this.getSmallChatData(), chart: data, step: step}
    }

    updateData(arr, step, selected){
        console.log(arr)
          // -> from base
         let end = this.arrDays.findIndex(item => item.x === arr[arr.length-1].x) 
        arr.forEach(elem => {   
            let index = this.arrDays.findIndex(item => item.x === elem.x) 
           
            console.log(index)         
            for(let i = index; i <= end; i++){
                 this.arrDays[i].y = elem.y
                
            }   
            // -> to base    
        });
        console.log(this.arrDays)
    }
    getSmallChatData(){
        // -> from base
        let min = this.arrDays[0].x
        let max = this.arrDays[this.arrDays.length - 1].x
        const step = Math.max(1, Math.round((max - min) / 10000000000));
        const data = [];
        let i = 0;

        while (i < this.arrDays.length && this.arrDays[i].x < min) {
            i++;
          }
        while (i < this.arrDays.length && this.arrDays[i].x <= max) {
            data.push(this.arrDays[i]);
            i += step;
        }
        console.log('getSmallChatData>>',data)
        return data
    }

}

module.exports = defaultData;