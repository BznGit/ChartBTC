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
        this.lengthDays = 10;
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
  
    }

    getDefaultData(division, width, timezone, def){
        console.log(division, width, timezone, def)
        if(def) this.setData(timezone)
       // console.log('this.arrWeeks 2 =', this.arrMonths);
        if (division === 'day') return this.arrDays;
        if (division === 'week') return this.arrWeeks;
        if (division === 'month') return this.arrMonths;
    }

    fetchData(min, max){
        console.log(min, max)
        console.log(this.arrDays)
        const start = this.arrDays.findIndex((item) => item.x === min);
        const end = this.arrDays.findIndex((item) => item.x === max)
        console.log('from to->', start, end)
        const data = [];
        for(let i = start; i <= end; i++){
            data.push(this.arrDays[i])
        }
        console.log(data)
        return data;
    }
}

module.exports = defaultData;