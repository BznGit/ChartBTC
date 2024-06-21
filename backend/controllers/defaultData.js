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
                y: y
            }
            this.arrDays.push(obj)
        }
        console.log('first')
    }

    getDefaultData(division, width, timezone, def){
        console.log(division, width, timezone, def)
        if(def) this.setData(timezone)
       // console.log('this.arrWeeks 2 =', this.arrMonths);
       
        if (division === 'day') { 
 
            const min = this.arrDays[0].x
            const max = this.arrDays[this.arrDays.length-1].x

            const step = Math.max(1, Math.round((max - min) / 1000000000));
            console.log('first step', step)
            const data = [];
            let i = 0;
            while (i < this.arrDays.length && this.arrDays[i].x < min) {
                i++;
              }
            while (i < this.arrDays.length && this.arrDays[i].x <= max) {
            data.push(this.arrDays[i]);
            i += step;
            }
            return {small: data, big: this.arrDays}
        };
        if (division === 'week') return this.arrWeeks;
        if (division === 'month') return this.arrMonths;
    }

    fetchData(min, max){
        console.log(min, max)
        const start = this.arrDays.findIndex((item) => item.x === min);
        const end = this.arrDays.findIndex((item) => item.x === max)
        console.log('from to->', end - start)
        console.log('max - min ', new Date(max - min).getDay());

        console.log('step', Math.max(1, Math.round((end - start) / 5)));
        const step = Math.max(1, Math.round((max - min) / 1000000000));
        console.log('step', Math.max(1, Math.round((end - start) / 1000000000)));
        const data = [];
        let i = 0;
        while (i < this.arrDays.length && this.arrDays[i].x < min) {
            i++;
          }
        while (i < this.arrDays.length && this.arrDays[i].x <= max) {
        data.push(this.arrDays[i]);
        i += step;
        }
       /* for(let i = start; i <= end; i += step){
            data.push(this.arrDays[i])
        }*/
        console.log(data)
        return {small: data, big: this.arrDays}
    }

    findClosestNumber(arr, target) {
        let closest = arr[0];
        let minDifference = Math.abs(target - arr[0].x);
      
        for (let i = 1; i < arr.length; i++) {
          let difference = Math.abs(target - arr[i].x);
          if (difference < minDifference) {
            minDifference = difference;
            closest = arr[i];
          }
        }
        const index = arr.indexOf(closest)
       // console.log('func:', closest, arr.indexOf(closest))
        return index
    }
}

module.exports = defaultData;