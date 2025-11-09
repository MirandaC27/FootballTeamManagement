const { buildTitle, resetDetailsBox } = require('./CalendarHelpers');

describe('CalendarHelpers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="teamName" value="Falcons" />
      <input id="team1" value="Falcons" />
      <input id="team2" value="Eagles" />
      <select id="matchType"><option value="friendly" selected>friendly</option></select>
      <input id="eventTitle" value="Annual Gala" />
      <div id="event-details" style="display: block;"></div>
      <div id="event-list">Some events</div>
      <div id="event-date">2025-11-08</div>
    `;
  });

  test('buildTitle returns correct practice title', () => {
    expect(buildTitle('practice')).toBe('Falcons practice');
  });

  test('buildTitle returns correct match title with type', () => {
    expect(buildTitle('match')).toBe('Falcons vs. Eagles (friendly)');
  });

  test('buildTitle returns correct event title', () => {
    expect(buildTitle('event')).toBe('Annual Gala');
  });

  test('resetDetailsBox clears and hides elements', () => {
    resetDetailsBox();
    expect(document.getElementById('event-details').style.display).toBe('none');
    expect(document.getElementById('event-list').innerHTML).toBe('');
    expect(document.getElementById('event-date').textContent).toBe('');
  });
});