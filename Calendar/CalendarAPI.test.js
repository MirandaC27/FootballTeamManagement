const { fetchCalendarData, addEvent, updateEvent, deleteEvent } = require('./CalendarAPI');

global.fetch = jest.fn();

describe('CalendarAPI', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetchCalendarData returns JSON on success', async () => {
    const mockData = { events: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });

    const result = await fetchCalendarData(2025, 10);
    expect(fetch).toHaveBeenCalledWith('/calendar/data/2025/11');
    expect(result).toEqual(mockData);
  });

  test('fetchCalendarData throws error on failure', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchCalendarData(2025, 10)).rejects.toThrow('HTTP 500');
  });

  test('addEvent returns true on success', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    const result = await addEvent({ name: 'Test Event' });
    expect(fetch).toHaveBeenCalledWith('/addEvent', expect.any(Object));
    expect(result).toBe(true);
  });

  test('updateEvent returns true on success', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    const result = await updateEvent('123', { name: 'Updated Event' });
    expect(fetch).toHaveBeenCalledWith('/updateEvent/123', expect.any(Object));
    expect(result).toBe(true);
  });

  test('deleteEvent returns true on success', async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    const result = await deleteEvent('123');
    expect(fetch).toHaveBeenCalledWith('/deleteEvent/123', { method: 'DELETE' });
    expect(result).toBe(true);
  });
});