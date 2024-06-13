const defaultData = class {
    setData(timezone) {
        let currTimeZone = new Date().getTimezoneOffset();
        console.log('->>',new Date (timezone).getHours(), new Date (currTimeZone).getHours())
        let hourDelta = (currTimeZone - timezone)/60*(-1); 

        let curr = new Date();
        let step = new Date();
        let start = new Date();

        // get days array ----------------------------------------------------------------/
        step.setDate(step.getDate() + 1);
        this.lengthDays = 365*3;
        this.arrDays = [];
        let cur = +curr;
        let nw = +step;
        let delta = (nw-cur) 
        for (let i = 0; i < this.lengthDays - 1; i++){
            let obj = {
                x: new Date((+start + delta*i)).setHours(hourDelta, 0, 0, 0),
                y: Math.random()*10
            }
            this.arrDays.push(obj)
        }
        
        // get week array ----------------------------------------------------------------/
        this.lengthWeeks = 52*3;
        this.arrWeeks = [];
        for (let i = 0; i < this.arrDays.length-1; i += 7) {
            this.arrWeeks.push(this.arrDays[i]);
        }

        // get months array ----------------------------------------------------------------/
        this.lengthMonths = 52*3;
        this.arrMonths = [];
        for (let i = 0; i < this.arrDays.length-1; i += 30) {
            this.arrMonths.push(this.arrDays[i]);
        }
    }
    getDefaultData(division, width, timezone){
        console.log(division, width, timezone)
        this.setData(timezone)
        if (division === 'day') return this.arrDays;
        if (division === 'week') return this.arrWeeks;
        if (division === 'month') return this.arrMonths;
    }
}

module.exports = defaultData;