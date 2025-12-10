//UI scripts

// CalendarUI.js
import { fetchCalendarData, addEvent, updateEvent, deleteEvent } from './CalendarAPI.js';
import { buildTitle, resetDetailsBox } from './CalendarHelpers.js';

function restoreDetailsLayout() {
  const detailsBox = document.getElementById('event-details');
  if (!detailsBox) return;

  detailsBox.innerHTML = `
    <h4>Event Details</h4>
    <p><strong>Date:</strong> <span id="event-date"></span></p>
    <div id="event-list-container">
      <strong>Events:</strong>
      <ul id="event-list" class="pl-3 mb-0"></ul>
    </div>
    <div id="event-location-container" class="mt-3">
      <strong>Location:</strong>
      <p id="event-location" class="mb-0 text-muted"></p>
    </div>
  `;
}


let currentUser = null;
let currentMonth, currentYear;

export function initCalendar(user) {
  currentUser = user;

  const monthYearLabel = document.getElementById('month-year');
  const calendarBody = document.getElementById('calendar-body');
  const addForm = document.getElementById('add-event-form');
  const formStatus = document.getElementById('form-status');
  const showFormBtn = document.getElementById('show-add-form');
  const tagSelect = document.getElementById('eventTag');
  const dynamicFields = document.getElementById('dynamic-fields');

  const today = new Date();
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();

  // Month navigation
  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(currentYear, currentMonth);
  });
  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(currentYear, currentMonth);
  });

  // Show/hide form
  showFormBtn.addEventListener('click', () => {
    addForm.style.display = 'block';
    showFormBtn.style.display = 'none';
  });
  document.getElementById('cancelBtn').addEventListener('click', () => {
    addForm.style.display = 'none';
    showFormBtn.style.display = 'inline-block';
    formStatus.textContent = '';
  });

  // Dynamic field generation by tag
  tagSelect.addEventListener('change', () => {
    const selected = tagSelect.value;
    dynamicFields.innerHTML = '';
    if (selected === 'practice') {
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="teamName">Team Name:</label>
          <input type="text" id="teamName" class="form-control" required>
        </div>`;
    } else if (selected === 'match') {
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="team1">Team 1:</label>
          <input type="text" id="team1" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="team2">Team 2:</label>
          <input type="text" id="team2" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="matchType">Match Type:</label>
          <select id="matchType" class="form-control" required>
            <option value="none">Regular</option>
            <option value="playoff">Playoff</option>
            <option value="championship">Championship</option>
          </select>
        </div>`;
    } else if (selected === 'event') {
      dynamicFields.innerHTML = `
        <div class="form-group">
          <label for="eventTitle">Event Title:</label>
          <input type="text" id="eventTitle" class="form-control" required>
        </div>`;
    }
  });

  // Add new event
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tag = tagSelect.value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value.trim();
    const locationCoords = [parseFloat(document.getElementById('latitude').value), parseFloat(document.getElementById('longitude').value)];

    try {
      const title = buildTitle(tag);
      const ok = await addEvent({ eventDate: date, 
                                  title, 
                                  tag, 
                                  location, 
                                  locationCoords,
                                  startTime: document.getElementById("startTime").value,
                                  endTime: document.getElementById("endTime").value
                                 });
      formStatus.textContent = ok ? 'Event added successfully!' : 'Could not add event.';
      if (ok) {
        addForm.reset();
        dynamicFields.innerHTML = '';
        await renderCalendar(currentYear, currentMonth);
      }
    } catch (err) {
      formStatus.textContent = err.message;
    }
  });

  // Click-away handler for details box
  document.addEventListener('click', (e) => {
    const detailsBox = document.getElementById('event-details');
    const withinDetails = e.target.closest('#event-details');
    const withinEventCell = e.target.closest('.event-cell');

    // Only hide if the click is completely outside both the details box and event cells
    if (!withinEventCell && !withinDetails) {
      if (detailsBox) detailsBox.style.display = 'none';
    }
  });

  renderCalendar(currentYear, currentMonth);
}

// Core calendar rendering
export async function renderCalendar(year, month) {
  const monthYearLabel = document.getElementById('month-year');
  const calendarBody = document.getElementById('calendar-body');
  const detailsBox = document.getElementById('event-details');
  resetDetailsBox();

  try {
    const result = await fetchCalendarData(year, month);
    const eventDays = result.eventDays || [];
    const days = result.data;

    monthYearLabel.textContent = `${result.monthName} ${result.year}`;
    calendarBody.innerHTML = '';

    for (const week of days) {
      const row = document.createElement('tr');
      for (const day of week) {
        const cell = document.createElement('td');
        if (!day) { row.appendChild(cell); continue; }

        cell.textContent = day;
        const eventsForDay = eventDays.filter(e => e.day === parseInt(day));

        if (eventsForDay.length > 0) {
          cell.classList.add('bg-warning', 'font-weight-bold', 'position-relative', 'event-cell');

          const dayNumber = document.createElement('div');
          dayNumber.textContent = day;
          const dotContainer = document.createElement('div');
          dotContainer.classList.add('tag-dots');
          const tagColors = { practice: 'green', match: 'red', event: 'blue' };

          const uniqueTags = [...new Set(eventsForDay.map(e => e.tag))];
          uniqueTags.forEach(tag => {
            const dot = document.createElement('span');
            dot.classList.add('tag-dot');
            dot.style.color = tagColors[tag] || 'gray';
            dot.textContent = '•';
            dotContainer.appendChild(dot);
          });

          cell.innerHTML = '';
          cell.appendChild(dayNumber);
          cell.appendChild(dotContainer);

          cell.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventDetails(eventsForDay, result, day, month, year);
          });
        }

        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
    }
  } catch (err) {
    console.error('Error rendering calendar:', err);
    monthYearLabel.textContent = 'Error loading calendar data.';
  }
}

// Details panel and edit/delete controls
export function showEventDetails(eventsForDay, result, day, month, year) {
  const detailsBox = document.getElementById('event-details');

  restoreDetailsLayout();

  const eventList = document.getElementById('event-list');
  const eventDate = document.getElementById('event-date');
  const eventLocation = document.getElementById('event-location');

  if (!eventList || !eventDate) return; // safety fallback
  eventList.innerHTML = '';
  eventDate.textContent = `${result.monthName} ${day}, ${result.year}`;

  const grouped = { practice: [], match: [], event: [] };
  eventsForDay.forEach(ev => grouped[ev.tag]?.push(ev));

  Object.keys(grouped).forEach(tag => {
    if (!grouped[tag].length) return;
    const tagHeader = document.createElement('li');
    tagHeader.innerHTML = `<span class="tag-${tag}">${tag.charAt(0).toUpperCase() + tag.slice(1)}</span>`;
    tagHeader.classList.add('mt-2', 'mb-1');
    eventList.appendChild(tagHeader);

    grouped[tag].forEach(ev => {
      const li = document.createElement('li');
      li.classList.add('mb-2');
      li.innerHTML = `<strong>${ev.title}</strong> 
                      <span class="badge badge-secondary tag-badge">${ev.tag}</span>
                      <br>
                      <small>${ev.startTime} – ${ev.endTime}</small>`;

      if (currentUser && currentUser.role === 'admin') {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('btn', 'btn-sm', 'btn-warning', 'ml-2');
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation(); 
          openEditForm(ev, `${result.year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'ml-2');
        delBtn.addEventListener('click', async () => {
          if (confirm(`Delete event "${ev.title}" on ${result.monthName} ${day}?`)) {
            const ok = await deleteEvent(ev.id);
            if (ok) {
              alert('Event deleted.');
              await renderCalendar(year, month);
              detailsBox.style.display = 'none';
            } else alert('Failed to delete event.');
          }
        });

        li.appendChild(editBtn);
        li.appendChild(delBtn);
      }

      eventList.appendChild(li);
    });
  });

  // Display location if all events share one, otherwise show a list
  if (eventsForDay.length > 0) {
    const uniqueLocations = [...new Set(eventsForDay.map(e => e.location).filter(Boolean))];
    if (uniqueLocations.length === 1) {
      eventLocation.textContent = uniqueLocations[0];
    } else if (uniqueLocations.length > 1) {
      eventLocation.innerHTML = uniqueLocations.map(loc => `<div>• ${loc}</div>`).join('');
    } else {
      eventLocation.textContent = 'No location specified';
    }
  }

  detailsBox.style.display = 'block';
}

// Edit form UI
export function openEditForm(eventObj, defaultDate) {

  const coordinates = eventObj.locationCoords;
  const detailsBox = document.getElementById('event-details');

  let marker = null;

  detailsBox.innerHTML = `
    <h4>Edit Event</h4>
    <form id="edit-event-form" class="border p-3 bg-light rounded">
      <div class="form-group">
        <label for="editTitle">Event Title:</label>
        <input type="text" id="editTitle" class="form-control" value="${eventObj.title}" required>
      </div>
      
      <div class="form-group">
        <label for="editDate">Event Date:</label>
        <input type="date" id="editDate" class="form-control" value="${defaultDate}" required>
      </div>

      <div class="form-group">
        <label for="editTag">Tag:</label>
        <select id="editTag" class="form-control" required>
          <option value="practice" ${eventObj.tag === 'practice' ? 'selected' : ''}>Practice</option>
          <option value="match" ${eventObj.tag === 'match' ? 'selected' : ''}>Match</option>
          <option value="event" ${eventObj.tag === 'event' ? 'selected' : ''}>Event</option>
        </select>
      </div>

      <div class="form-group">
        <label for="editLocation">Location:</label>
        <input type="text" id="editLocation" class="form-control" value="${eventObj.location || ''}" placeholder="Enter event location" required>
        <input type="hidden" id="latitude">
        <input type="hidden" id="longitude">
      </div>
      <div id="editMap" style="height: 300px; border: 1px solid #ccc; border-radius: 6px;"></div>

      <div class="form-group">
        <label for="startTime">Start Time:</label>
        <input type="time" id="editStartTime" class="form-control" value="${eventObj.startTime}" required>
      </div>

      <div class="form-group">
        <label for="endTime">End Time:</label>
        <input type="time" id="editEndTime" class="form-control" value="${eventObj.endTime}" required>
      </div>

      <div class="text-center">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" id="cancelEdit" class="btn btn-secondary ml-2">Cancel</button>
      </div>
      <p id="edit-status" class="text-center mt-3"></p>
    </form>
  `;
  detailsBox.style.display = 'block';

  const priorLat = coordinates && coordinates.length > 0 ? coordinates[0] : null;
  const priorLng = coordinates && coordinates.length > 1 ? coordinates[1] : null;

  const map = L.map('editMap').setView([39.8283, -98.5795], 4);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  if (coordinates) {
    marker = L.marker([priorLat, priorLng]).addTo(map);
  }

  function placeMarker(lat, lng, label = null) {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    if (label) marker.bindPopup(label).openPopup();
    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lng;
  }

  const provider = new window.GeoSearch.OpenStreetMapProvider();
  const searchControl = new window.GeoSearch.GeoSearchControl({
    provider: provider,
    style: 'bar',
    autoClose: true,
    keepResult: true,
    showMarker: false
  });
  map.addControl(searchControl);
  map.on('geosearch/showlocation', (result) => {
    const { x: lng, y: lat, label } = result.location;
    placeMarker(lat, lng, label);
    document.getElementById("editLocation").value = label;
    map.setView([lat, lng], 15);
  });
  map.on('click', async (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    const results = await provider.search({ query: `${lat}, ${lng}` });
    const label = results.length > 0 ? results[0].label : `${lat}, ${lng}`;

    placeMarker(lat, lng, label);
    document.getElementById("editLocation").value = label;
  });
  if (eventObj.location) {
    provider.search({ query: eventObj.location }).then(results => {
      if (results.length > 0) {
        const { x: lng, y: lat, label } = results[0];
        placeMarker(lat, lng, label);
        map.setView([lat, lng], 14);
      }
    });
  }

  const form = document.getElementById('edit-event-form');
  const statusText = document.getElementById('edit-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTitle = document.getElementById('editTitle').value.trim();
    const newDate = document.getElementById('editDate').value;
    const newTag = document.getElementById('editTag').value;
    const newLocation = document.getElementById('editLocation').value.trim();
    const newCoordinates = [parseFloat(document.getElementById("latitude").value), parseFloat(document.getElementById("longitude").value)];
    const newStartTime = document.getElementById("editStartTime").value;
    const newEndTime = document.getElementById("editEndTime").value;
    if (!newTitle || !newDate || !newTag || !newLocation || !newCoordinates || !newStartTime || !newEndTime) {
      statusText.textContent = 'Please ensure all attributes are filled.';
      return;
    }

    const ok = await updateEvent(eventObj.id||eventObj._id, { title: newTitle, 
                                                eventDate: newDate, 
                                                tag: newTag, 
                                                location: newLocation, 
                                                locationCoords: newCoordinates,
                                                startTime: newStartTime,
                                                endTime: newEndTime});
    statusText.textContent = ok ? 'Event updated successfully!' : 'Could not update event.';
    if (ok) {
      await renderCalendar(currentYear, currentMonth);
      setTimeout(() => { detailsBox.style.display = 'none'; }, 1000);
    }
  });

  document.getElementById('cancelEdit').addEventListener('click', async () => {
    resetDetailsBox();
    detailsBox.style.display = 'none';
    await renderCalendar(currentYear, currentMonth);
  });

  console.log("Updating event:", eventObj);
  console.log("Using ID:", eventId);
}
