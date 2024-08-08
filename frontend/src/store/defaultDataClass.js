const defaultDataClass = class {
    dalitel = Math.pow(10, 10)
    setData() {
        
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
        for (let i = 1; i < this.lengthDays; i++){
            y += 5 - Math.random() * 10;
            let obj = {
                x: new Date((+start + delta*i)).setHours(0, 0, 0, 0),
                y: y
            }
            this.arrDays.push(obj) // -> to base
        }
        //console.log('first')
        return this.arrDays
    }

    setDataHist() {
        let curr = +new Date();
        let step = new Date();
        let start = +new Date(2023, 7, 3 );
        // get days array ----------------------------------------------------------------/
        step.setDate(step.getDate() + 1);
        this.lengthDaysHist = Math.trunc((curr - start)/(1000*3600*24))+1
        this.arrDaysHist = [];
        let delta = (step - curr)

        let y = 100;
        for (let i = 0; i < this.lengthDaysHist; i++){
            y += 5 - Math.random() * 10;
            let obj = {
                x: new Date((start + delta*i)).setHours(0, 0, 0, 0),
                y: y
            }
            this.arrDaysHist.push(obj) // -> to base
        }
      //  console.log('first', new Date(this.arrDaysHist[this.arrDaysHist.length-1].x))
        return this.arrDaysHist
    }


    fetchData(min, max, arrDays){

        const step = Math.max(1, Math.round((max - min) / this.dalitel));
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
        const { chart  } = this.getSmallChatData(arrDays)
        return {smallChart: chart, chart: data, step: step}
    }

    updateData(arr, arrDays, step, selected){
    
        let mode = 0
        switch(selected){
            case 'equals': mode = 0
                break
            case 'increment': mode = 1
                break
            case 'decrement': mode = 1
                break
        }
        let delta = 0
        if(step != 1) delta = Math.trunc(step / 2)
          let end = arrDays.findIndex(item => item.x === arr[arr.length-1].x) + delta
        if(end > arrDays.length - 1) end = arrDays.length - 1
        arr.forEach(elem => {   
            let index = arrDays.findIndex(item => item.x === elem.x) - delta
          //  console.log(index, end)
            if(index < 0) index = 0 
            let dl = elem.y -  arrDays[index].y    
            for(let i = index; i <= end; i++){
             //   console.log(elem.y)
                if(mode != 0) 
                    arrDays[i].y = arrDays[i].y + dl;
                else{
                    arrDays[i].y = elem.y
               
                }
                   
            }   
        });
        return arrDays
    }
    
    getSmallChatData(dataq){
        // -> from base
       // console.log('getSmallChatData befor >>', arrDays.length)

        let arrDays = JSON.parse(JSON.stringify(dataq)) 
        let min = arrDays[0].x
        let max = arrDays[arrDays.length - 1].x
        const step = Math.max(1, Math.round((max - min) / this.dalitel));
        const data = [];

        for(let i = 0; i < arrDays.length; i+=step){
            let sum = 0
            for(let j=i; j<i+step; j++){
                if(j<arrDays.length)sum += arrDays[j].y
                        
            }
            let obj = {
                x: arrDays[i].x, 
                y: sum/step
            }
            data.push(obj)
        }
       // console.log(data)
      //  console.log('getSmallChatData>>',data.length)
        return {chart: data, step: step}
    }

}

export default defaultDataClass;