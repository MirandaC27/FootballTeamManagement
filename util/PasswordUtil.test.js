const passutil = require('./PasswordUtil');

/**
 * Hashing password test.
 */
test('Hash the password', function() {
    const pwd = "123";
    const hashedpwd = passutil.hashPassword(pwd);

    expect(hashedpwd).not.toBeNull();
    expect(hashedpwd).not.toEqual(pwd);
});

/**
 * Compare passwords test.
 */
test('Comparing passwords', function() {
    const pwd = "123";
    const wrongPwd = "abc";
    const hashedpwd = passutil.hashPassword(pwd);

    const same1 = passutil.comparePassword(pwd, hashedpwd);
    const same2 = passutil.comparePassword(wrongPwd, hashedpwd);

    expect(same1).toBeTruthy();
    expect(same2).toBeFalsy(); 
});
