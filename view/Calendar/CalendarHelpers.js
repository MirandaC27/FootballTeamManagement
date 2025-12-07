// CalendarHelpers.js

/**
 * build an event title based on the given tag for event
 * @param {*} tag tag of current of event
 * @returns resulting title
 */
export function buildTitle(tag) {
  if (tag === 'practice') {
    const team = document.getElementById('teamName')?.value.trim();
    if (!team) throw new Error('Team name is required.');
    return `${team} practice`;
  }
  if (tag === 'match') {
    const team1 = document.getElementById('team1')?.value.trim();
    const team2 = document.getElementById('team2')?.value.trim();
    const matchType = document.getElementById('matchType')?.value;
    if (!team1 || !team2) throw new Error('Both team names are required.');
    return matchType !== 'none'
      ? `${team1} vs. ${team2} (${matchType})`
      : `${team1} vs. ${team2}`;
  }
  if (tag === 'event') {
    const title = document.getElementById('eventTitle')?.value.trim();
    if (!title) throw new Error('Event title is required.');
    return title;
  }
  throw new Error('Please select a valid tag.');
}

export function resetDetailsBox() {
  const detailsBox = document.getElementById('event-details');
  const eventList = document.getElementById('event-list');
  const eventDate = document.getElementById('event-date');
  if (detailsBox) detailsBox.style.display = 'none';
  if (eventList) eventList.innerHTML = '';
  if (eventDate) eventDate.textContent = '';
}


