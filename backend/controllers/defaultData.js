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
        this.lengthDays = 365;
        this.arrDays = [];
        let cur = +curr;
        let nw = +step;
        let delta = (nw-cur) 
        for (let i = 0; i < this.lengthDays; i++){
            let obj = {
                x: new Date((+start + delta*i)).setHours(hourDelta, 0, 0, 0),
                y: 5//Math.random()*10
            }
            this.arrDays.push(obj)
        }
        this.getAvereageData(this.arrDays)
    }

    getAvereageData(data){
        this.lengthWeeks = Math.trunc(data.length / 7);
        this.arrWeeks = [];
        let obj = {
            x: data[0].x,
            y: data[0].y,
        }
        this.arrWeeks.push(obj);
        for (let i = 6; i < data.length; i += 7){
            let sum = 0 
            let j = 0
       
            for (j = 0; j < i; j++) {
                sum += data[j].y;  
            }
            let obj = {
                x: data[j].x,
                y: sum / j
            }
            this.arrWeeks.push(obj);
        }
     
      ///  console.log('this.arrWeeks=', this.arrWeeks);

        // get months array ----------------------------------------------------------------/
        this.arrMonths = [];
        this.lengthMonth = Math.trunc(data.length / 30) + 1;
        let objMonth = {
            x: data[0].x,
            y: data[0].y,
        }
        this.arrMonths.push(objMonth);
        for (let i = 30; i < data.length; i += 30){
            let sum = 0 
            let j = 0
            for (j = 0; j < i; j++) {
                sum += data[j].y;  
            }
            let obj = {
                x: data[j].x,
                y: sum / j
            }
            this.arrMonths.push(obj);
        }

    
    }

    getDefaultData(division, width, timezone, def){
        console.log(division, width, timezone, def)
        if(def) this.setData(timezone)
       // console.log('this.arrWeeks 2 =', this.arrMonths);
        if (division === 'day') return this.arrDays;
        if (division === 'week') return this.arrWeeks;
        if (division === 'month') return this.arrMonths;
    }

    getNewData(data, newDivision, oldDivision){
        console.log('in->', data, oldDivision, data.length)

        if(oldDivision=='day') {
            this.arrDays = data
        } else{
            for(let i = 1; i < data.length ; i ++) {
                console.log('data[i].x->', data[i].x)
                let index = this.arrDays.findIndex(item=>item.x === data[i].x)
                console.log('index=',index)
                if(oldDivision=='week'){
                    for(let j = index - 6; j <= index ; j ++){
                        this.arrDays[j].y = data[i].y
                    }
                }
                if(oldDivision=='month'){
                    for(let j = index - 29; j <= index ; j ++){
                        this.arrDays[j].y = data[i].y
                    }
                } 
            };
        }

        this.getAvereageData(this.arrDays)
        if (newDivision === 'day') return this.arrDays;
        if (newDivision === 'week') return this.arrWeeks;
        if (newDivision === 'month') return this.arrMonths;
    }
}

module.exports = defaultData;