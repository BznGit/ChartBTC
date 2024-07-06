
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
        let delta = (nw - cur) 
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
        return this.arrDays
    }

    getDefaultData(division, width, timezone, def){
     
        let arrDays;
        if(def) arrDays =  this.setData(timezone)
        return {smallChart: this.getSmallChatData(arrDays), chart: this.getSmallChatData(arrDays), arrDays: arrDays}

    }

    fetchData(min, max, arrDays){
        console.log(min, max)
        console.log('arrDays', arrDays.length)
        const step = Math.max(1, Math.round((max - min) / 10000000000));
        const data = [];
        let i = 0;
        // -> from base
        while (i < arrDays.length && arrDays[i].x < min) {
            i++;
        }
        while (i < arrDays.length && arrDays[i].x <= max) {
            data.push(arrDays[i]);
            i += step;
        }

        return {smallChart: this.getSmallChatData(arrDays), chart: data, step: step}
    }

    updateData(arr, arrDays){
    console.log('length>', arrDays.length)
          // -> from base
         let end = arrDays.findIndex(item => item.x === arr[arr.length-1].x) 
        arr.forEach(elem => {   
            let index = arrDays.findIndex(item => item.x === elem.x) 
           
           // console.log(index)         
            for(let i = index; i <= end; i++){
                 arrDays[i].y = elem.y
                
            }   
            // -> to base    
        });
        return arrDays
    }
    getSmallChatData(arrDays){
        // -> from base
        console.log('getSmallChatData befor >>',arrDays.length)
        let min = arrDays[0].x
        let max = arrDays[arrDays.length - 1].x
        const step = Math.max(1, Math.round((max - min) / 10000000000));
        const data = [];
        let i = 0;

        while (i < arrDays.length && arrDays[i].x < min) {
            i++;
          }
        while (i < arrDays.length && arrDays[i].x <= max) {
            data.push(arrDays[i]);
            i += step;
        }
        console.log('getSmallChatData>>',data.length)
        return data
    }

}

module.exports = defaultData;