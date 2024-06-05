const defaultData = class {
    constructor() {
        let curr = new Date()
        let step = new Date()
        let start = new Date();
        step.setDate(step.getDate() + 1);
        let lengthSettings = 10;
        this.arrData = [];
        let cur = +curr
        let nw = +step
        let delta = (nw-cur) 
        for (let i = 0; i < lengthSettings - 1; i++){
            let obj = {
                x: new Date(+start + delta*i).setHours(0, 0, 0, 0),
                y: 5
            }
            this.arrData.push(obj)
        }
    }
    getDefaultData(){
        return  this.arrData
    }
}

module.exports = defaultData;