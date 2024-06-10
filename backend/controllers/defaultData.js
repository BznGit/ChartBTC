const defaultData = class {
    constructor() {
        let curr = new Date()
        let step = new Date()
        let start = new Date();
        step.setDate(step.getDate() + 1);
        this.length = 10;
        this.arrData = [];
        let cur = +curr
        let nw = +step
        let delta = (nw-cur) 
        for (let i = 0; i < this.length - 1; i++){
            let obj = {
                x: new Date(+start + delta*i).setHours(0, 0, 0, 0),
                y: Math.random()*10
            }
            
            this.arrData.push(obj)
        }
    }
    getDefaultData(width){
        console.log('width = ', width)
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