

function generateMonth (year, month){
    const monthArr = Array.from({ length: 6}, () => new Array(7).fill(""));
    const startDayInWeek = new Date(year, month, 1).getDay();
    const monthLong = new Date(year, month+1, 0).getDay();
    
    let counter = 1;
    let started = false;

    for(let x = 0; x < 6; x++){
        for(let y = 0; y < 7; y++){
            if(!started && startDayInWeek){
                started = true;
            }

            else if(started && counter <= monthLong){
                monthArr[x][y] = counter;
                counter++;
            }

            else{
                monthArr[x][y] = "";
            }
        }
    }
    return monthArr
}

function calendarArray(year, monthIndex = null){

    if(monthArray != null){
        return generateMonth(year, monthIndex);
    }

    else{
        const arr = [];
        for(let m = 0; m < 12; m++){
            arr.push(generateMonth(year,m));
        }
        return arr;
    }   
}

module.exports = calendarArray;