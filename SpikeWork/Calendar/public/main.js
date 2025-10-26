const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let currentMonth = 0; // start at January
let calendarData = null; 

document.getElementById("loadBtn").addEventListener("click", async () => {
  const year = document.getElementById("yearInput").value;
  const res = await fetch(`/api/calendar/${year}`);
  calendarData = await res.json();

  currentMonth = 0; // reset to January
  renderCalendar();
});

function renderCalendar() {
  if (!calendarData) return;

  const container = document.getElementById("output");
  container.innerHTML = ""; 

  const monthData = calendarData.data[currentMonth];
  const monthName = monthNames[currentMonth];
  const year = calendarData.year;

  //Header
  const header = document.createElement("div");
  header.innerHTML = `
    <h2>${monthName} ${year}</h2>
    <button id="prevMonth"> Prev </button>
    <button id="nextMonth"> Next </button>
  `;
  container.appendChild(header);

  //Calendar Table
  const table = document.createElement("table");

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  weekdays.forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (let week of monthData) {
    const tr = document.createElement("tr");
    for (let day of week) {
      const td = document.createElement("td");
      td.textContent = day || "";
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  container.appendChild(table);

  //Month navigation
  document.getElementById("prevMonth").addEventListener("click", () => {
    if (currentMonth > 0) {
      currentMonth--;
      renderCalendar();
    }
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    if (currentMonth < 11) {
      currentMonth++;
      renderCalendar();
    }
  });
}

