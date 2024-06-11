const defaultData = class {
    setData(timezone) {
        console.log('--', timezone)
        let currTimeZone = new Date().getTimezoneOffset();
        console.log(new Date (timezone).getHours(), new Date (currTimeZone).getHours())
        let hourDelta = (currTimeZone - timezone)/60*(-1); 
        console.log('hourDelta = ', hourDelta)
        /*let currentDate = new Date();
        let currentTime = currentDate.getTime();
        let curr = new Date(currentTime - timezone * 60000);*/
        let curr = new Date();
        let step = new Date();
        let start = new Date();
        step.setDate(step.getDate() + 1);
        this.length = 10;
        this.arrData = [];
        let cur = +curr
        let nw = +step
        let delta = (nw-cur) 
        for (let i = 0; i < this.length - 1; i++){
            let obj = {
                x: new Date((+start + delta*i)).setHours(hourDelta, 0, 0, 0),
                y: Math.random()*10
            }
            
            this.arrData.push(obj)
        }
    }
    getDefaultData(width, timezone){

        this.setData(timezone)

        let chartArr = [];
        let delta = Math.round(this.length / width)*10
        console.log('delta 0 = ', delta)
        if(delta < 1) delta = 1*10
        console.log('delta = ', delta)
        for (let i = 0; i < this.arrData.length-1; i += delta) {
            chartArr.push(this.arrData[i]);
        }
        console.log(chartArr.length)
        return this.arrData// chartArr
    }
}

module.exports = defaultData;