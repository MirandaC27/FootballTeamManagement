// CalendarAPI.js
/**
 * fetch the calendar data for the Frontend
 * @param {*} year selected year for calendar
 * @param {*} month selected month for calendar
 * @returns json data for calendar
 */
export async function fetchCalendarData(year, month) {
  const res = await fetch(`/calendar/data/${year}/${month + 1}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * add event json to calendar
 * @param {*} eventData json data for event
  * @returns response object to send back
 */
export async function addEvent(eventData) {
  const res = await fetch('/addEvent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  return res.ok;
}

/**
 * update event json on calendar
 * @param {*} id id of requested event object
 * @param {*} data data of event object
 * @returns response object to send back
 */
export async function updateEvent(id, data) {
  const res = await fetch(`/updateEvent/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.ok;
}

/**
 * delete event json from calendar
 * @param {*} id of object for deletion
 * @returns response object to send back
 */
export async function deleteEvent(id) {
  const res = await fetch(`/deleteEvent/${id}`, { method: 'DELETE' });
  return res.ok;
}



