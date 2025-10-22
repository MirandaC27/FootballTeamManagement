// calendar-config.test.js
const calendarArray = require('./calendar-config');

  test('generate the month of January 2025 correctly', () => {
    const result = calendarArray(2025, 0); // January 2025
    expect(result).toHaveProperty('year', 2025);
    expect(result).toHaveProperty('monthName', 'January');
    expect(result).toHaveProperty('data');

    const data = result.data;
    expect(data.length).toBe(6);          // 6 weeks
    data.forEach(week => {
      expect(week.length).toBe(7);        // 7 days
    });

    // Check first day placement (Jan 1, 2025 is a Wednesday)
    expect(data[0][0]).toBe('');         // Sunday
    expect(data[0][1]).toBe('');         // Monday
    expect(data[0][2]).toBe('');        // Tuesday
    expect(data[0][3]).toBe('1');       //Wednesday
  });

  test('generate the current year (2025) correctly', () => {
    const result = calendarArray(2025);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(12);

    result.forEach((monthObj, index) => {
      expect(monthObj).toHaveProperty('year', 2025);
      expect(monthObj).toHaveProperty('monthName');
      expect(monthObj).toHaveProperty('data');

      // Data structure
      const data = monthObj.data;
      expect(data.length).toBe(6);
      data.forEach(week => {
        expect(week.length).toBe(7);
      });
    });
  });

  test('leap year 2024 correctness', () => {
    const feb2024 = calendarArray(2024, 1); // Feb 2024 (leap year)
    const days = feb2024.data.flat().filter(d => d !== '');
    expect(days[days.length - 1]).toBe('29'); // Feb 29 exists in leap year

    const feb2025 = calendarArray(2025, 1); // Feb 2025
    const days2025 = feb2025.data.flat().filter(d => d !== '');
    expect(days2025[days2025.length - 1]).toBe('28'); // Feb 28 in non-leap year
  });


