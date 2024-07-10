const defaultData = class {
    setData() {
 
        let curr = new Date();
        let step = new Date();
        let start = new Date();

        // get days array ----------------------------------------------------------------/
        step.setDate(step.getDate() + 1);
        this.lengthDays = 100;
        this.arrDays = [];
        let cur = +curr;
        let nw = +step;
        let delta = (nw - cur) 
        let y = 100;
        for (let i = 0; i < this.lengthDays; i++){
            y += 5 - Math.random() * 10;
            let obj = {
                x: new Date((+start + delta*i)).setHours(0, 0, 0, 0),
                y: 10//y
            }
            this.arrDays.push(obj) // -> to base
        }
      //  console.log('first')
        return this.arrDays
    }


    fetchData(min, max, arrDays){

        const step = Math.max(1, Math.round((max - min) / 10000000000));
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
        console.log('arr>', arr)
        console.log('arr>', )
        let end = arrDays.findIndex(item => item.x === arr[arr.length-1].x) + delta
        if(end > arrDays.length -1) end = arrDays.length - 1
        arr.forEach(elem => {   
            let index = arrDays.findIndex(item => item.x === elem.x) - delta
            console.log(index, end)
            if(index < 0) index = 0 
            let dl = elem.y -  arrDays[index].y    
            for(let i = index; i <= end; i++){
                console.log(elem.y)
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
        const step = Math.max(1, Math.round((max - min) / 10000000000));
        const data = [];
        let i = 0;

        while (i < arrDays.length && arrDays[i].x < min) {
            i++;
        }
        while (i < arrDays.length && arrDays[i].x <= max) {
            data.push(arrDays[i]);
            i += step;
        }
      //  console.log('getSmallChatData>>',data.length)
        return {chart: data, step: step}
    }

}

export default defaultData;