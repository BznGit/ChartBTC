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
        this.lengthDays = 7*1;
        this.arrDays = [];
        let cur = +curr;
        let nw = +step;
        let delta = (nw-cur) 
        for (let i = 0; i < this.lengthDays; i++){
            let obj = {
                x: new Date((+start + delta*i)).setHours(hourDelta, 0, 0, 0),
                y:5// Math.random()*10
            }
            this.arrDays.push(obj)
        }
     //   console.log('this.arrDays=', this.arrDays);

        // get week array ----------------------------------------------------------------/
        this.lengthWeeks = Math.trunc(this.lengthDays / 7);
        this.arrWeeks = [];
        let obj = {
            x: this.arrDays[0].x,
            y: this.arrDays[0].y,
        }
        this.arrWeeks.push(obj);
        for (let i = 6; i < this.arrDays.length; i += 7){
            let sum = 0 
            let j = 0
       
            for (j = 0; j < i; j++) {
                sum += this.arrDays[j].y;  
            }
            let obj = {
                x: this.arrDays[j].x,
                y: sum / j
            }
            this.arrWeeks.push(obj);
        }
     
      ///  console.log('this.arrWeeks=', this.arrWeeks);

        // get months array ----------------------------------------------------------------/
        this.arrMonths = [];
        this.lengthMonth = Math.trunc(this.lengthDays / 30) + 1;
        let objMonth = {
            x: this.arrDays[0].x,
            y: this.arrDays[0].y,
        }
        this.arrMonths.push(objMonth);
        for (let i = 30; i < this.arrDays.length; i += 30){
            let sum = 0 
            let j = 0
            for (j = 0; j < i; j++) {
                sum += this.arrDays[j].y;  
            }
            let obj = {
                x: this.arrDays[j].x,
                y: sum / j
            }
            this.arrMonths.push(obj);
        }
      //  console.log('this.arrMonths=', this.arrMonths);
    }
    getDefaultData(division, width, timezone){
        console.log(division, width, timezone)
        this.setData(timezone)
       // console.log('this.arrWeeks 2 =', this.arrMonths);
        if (division === 'day') return this.arrDays;
        if (division === 'week') return this.arrWeeks;
        if (division === 'month') return this.arrMonths;
    }

    getNewData(data, division){
        console.log('in->', data, division, data.length-1)
        for(let i = 1; i < data.length ; i ++) {
            console.log('data[i].x->', data[i].x)
            let index = this.arrDays.findIndex(item=>item.x === data[i].x)
            console.log('index=',index)
            if(division=='day'){
                for(let j = index - 6; j <= index ; j ++){
                    this.arrDays[j].y = data[i].y
                }
            } 
        };
        console.log('this.arrDays>>>', this.arrDays)
    }
}

module.exports = defaultData;