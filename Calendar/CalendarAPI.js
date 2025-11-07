// CalendarAPI.js
export async function fetchCalendarData(year, month) {
  const res = await fetch(`/calendar/data/${year}/${month + 1}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addEvent(eventData) {
  const res = await fetch('/addEvent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  return res.ok;
}

export async function updateEvent(id, data) {
  const res = await fetch(`/updateEvent/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.ok;
}

export async function deleteEvent(id) {
  const res = await fetch(`/deleteEvent/${id}`, { method: 'DELETE' });
  return res.ok;
}



