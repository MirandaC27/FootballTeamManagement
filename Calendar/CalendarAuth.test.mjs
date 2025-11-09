let checkLoggedUser;

beforeAll(async () => {
  ({ checkLoggedUser } = await import('./CalendarAuth.js'));
});

global.fetch = jest.fn();

describe('CalendarAuth', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="signin-btn"></button>
      <div id="account-dropdown"></div>
      <button id="show-add-form"></button>
      <div id="form-status"></div>
      <div id="admin"></div>
    `;
    fetch.mockClear();
  });

  test('checkLoggedUser shows admin UI for admin user', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ role: 'admin' }),
    });

    const user = await checkLoggedUser();
    expect(user.role).toBe('admin');
    expect(document.getElementById('signin-btn').style.display).toBe('none');
    expect(document.getElementById('account-dropdown').style.display).toBe('block');
    expect(document.getElementById('admin').style.display).toBe('block');
    expect(document.getElementById('show-add-form').style.display).toBe('inline-block');
  });

  test('checkLoggedUser shows limited UI for non-admin user', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ role: 'user' }),
    });

    const user = await checkLoggedUser();
    expect(user.role).toBe('user');
    expect(document.getElementById('admin').style.display).toBe('none');
    expect(document.getElementById('form-status').textContent).toBe(
      'You must be an admin to add or delete a event.'
    );
  });

  test('checkLoggedUser returns null on invalid user', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({}),
    });

    const user = await checkLoggedUser();
    expect(user).toBeNull();
  });
});
