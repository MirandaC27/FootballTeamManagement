/**
 * Create and return the array for a single month.
 * @param {*} year requested year of the month
 * @param {*} month requested month
 */
function generateMonth(year, month) {
  const monthArr = Array.from({ length: 6 }, () => new Array(7).fill(""));
  const startDayInWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let day  = 1;

  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 7; y++) {

      if (x === 0 && y < startDayInWeek) {
        continue;
      }

      if (day <= daysInMonth){
        monthArr[x][y] = day.toString();
        day++;
      }

    }
  }

  return monthArr;
}

/**
 * Create and return the array for requested configuration (whole year or just month).
 * @param {*} year requested year of the month
 * @param {*} monthIndex requested month
 */
function calendarArray(year, monthIndex = null) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Single month case
  if (monthIndex != null) {
    return {
      year: year,
      monthName: months[monthIndex],
      data: generateMonth(year, monthIndex),
    };
  }

  // Full year case
  else {
    const arr = [];
    for (let m = 0; m < 12; m++) {
      arr.push({
        year: year,
        monthName: months[m],
        data: generateMonth(year, m),
      });
    }
    return arr;
  }
}


module.exports = calendarArray;
