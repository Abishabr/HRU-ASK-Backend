exports.validateRegister = (data) => {
    const { firstName, lastName, email, password, confirmPassword } = data;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return { valid: false, message: 'All fields are required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format' };
    }
    if (password !== confirmPassword) {
        return { valid: false, message: 'Passwords do not match' };
    }

    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long' };
    }

    return { valid: true };
};
export const validateLogin = (data) => {
    const { email, password } = data;
    if (!email || !password) {
        return { valid: false, message: 'Email and password are required' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format' };
    }
    return { valid: true };
};
