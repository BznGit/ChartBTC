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
            const start = 0;
            const end = this.arrDays.length-1
            const step = Math.max(1, Math.round((max - min) / 10000000000));
            console.log('first step', step)
            const data = [];
            let i = 0;
          /*  while (i < this.arrDays.length && this.arrDays[i].x < min) {
                i++;
              }
            while (i < this.arrDays.length && this.arrDays[i].x <= max) {
            data.push(this.arrDays[i]);
            i += step;
            }*/
            let k = 0;
            let sum = 0;
             for(let i = start; i <= end; i++){
                 sum += this.arrDays[i].y;
                 if(k === step){
                     let avarege = sum / k
     
                     data.push({x: this.arrDays[i - k].x, y:avarege })
                     k = 0; 
                     sum =0  
                 } else k++
                 
             }
            return {small: data, big: this.arrDays, step: step}
        };
        if (division === 'week') return this.arrWeeks;
        if (division === 'month') return this.arrMonths;
    }

    fetchData(min, max){
        console.log(min, max)
        const start = this.arrDays.findIndex((item) => item.x === min);
        const end = this.arrDays.findIndex((item) => item.x === max)

        const step = Math.max(1, Math.round((max - min) / 10000000000));
        const data = [];
        let i = 0;
        console.log('step=',step)
       /* while (i < this.arrDays.length && this.arrDays[i].x < min) {
            i++;
          }
        while (i < this.arrDays.length && this.arrDays[i].x <= max) {
        data.push(this.arrDays[i]);
        i += step;
        }*/
       let k = 0;
       let sum = 0;
        for(let i = start; i <= end; i++){
            sum += this.arrDays[i].y;
            if(k === step){
                let avarege = sum / k

                data.push({x: this.arrDays[i - k].x, y:avarege })
                k = 0; 
                sum =0  
            } else k++
            
        }
       // console.log(data)
        return {small: data, big: this.arrDays, step: step}
    }
   /* updateData(arr, step, selected){
        console.log(arr, step, selected)

        let index1 = this.arrDays.findIndex(item => item.x === arr[0].x)
        let index2 = this.arrDays.findIndex(item => item.x === arr[arr.length - 1].x)
        console.log(index1, index2)
        let startIndex = null;
        let endIndex = null
        if(step == 1) {
            startIndex = index1;
            endIndex = index2
        } else {
            startIndex = index1 - Math.trunc(step / 2);
            endIndex = index2 + Math.trunc(step / 2)
        }
        console.log(startIndex, endIndex)
        if(startIndex < 0) startIndex = 0; 
        if(startIndex > this.arrDays.length - 1) startIndex = this.arrDays.length - 1; 
        for(let i = startIndex; i <= endIndex; i++){
           this.arrDays[i].y = arr[0].y;
        }
        console.log(this.arrDays)
       
    }*/
    updateData(arr, step, selected){
        console.log( 'step=', step )

        let startIndex = null;
        let endIndex = null
      //  if(step == 1) {
           arr.forEach(elem => {   
                let index = this.arrDays.findIndex(item => item.x === elem.x) 
               this.arrDays[index].y = elem.y  
               console.log('step -<1',arr )         
            });
      //  } else {
            arr.forEach(elem => {   
                let index = this.arrDays.findIndex(item => item.x === elem.x) 
                let delta = elem.y - this.arrDays[index].y
                this.arrDays[index].y = elem.y   
                startIndex = index - Math.trunc(step / 2);
                endIndex = index + Math.trunc(step / 2) ;
                if(startIndex < 0) startIndex = 0; 
                if(endIndex > this.arrDays.length - 1) endIndex = this.arrDays.length - 1; 
                for(let i = startIndex; i <= endIndex; i++){
                    if( i!= index) this.arrDays[i].y =this.arrDays[i].y + delta;
                    
                  }       
            });

      //  }
        console.log(this.arrDays)
       
    }


}

module.exports = defaultData;