function month(year){
    let arr = new Array(12);
    for(let x = 0; x < arr.length; x++){
        arr[x] = new Array(6);
    }

    for(let x = 0; x < arr.length; x++){
        for(let y = 0; y < arr[x].length; y++){
            arr[x][y] = new Array(7);
        }
    }

    for(let month = 0; month < arr.length; month++){
        let startDayInWeek = new Date(year, month, 1).getDay();
        let daysInMonth = new Date(year,month + 1,0).getDate();
        let day = 1;
        //let beforeCount = 0;
        //let counter = 1

        let startCount = false;

        for(let x = 0; x < 6; x++) {
            for(let y = 0; y < 7; y++){
            if (x === 0 && y < startDayInWeek) {
                arr[month][x][y] = "";
            } 

            else if (day <= daysInMonth) {
                arr[month][x][y] = day;
                day++;
            } 

            else {
                arr[month][x][y] = "";
            }

            }
        }
    }
    return arr;
}

module.exports = {
    month
}