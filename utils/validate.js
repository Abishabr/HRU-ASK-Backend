import e from "express";

export const validateRegister = (data) => {
    const { firstName, lastName, email, password, confirmPassword } = data;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return { valid: false, message: 'All fields are required' };
    }
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        return { valid: false, message: 'First name and last name must contain only letters' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format' };
    }
    if (password !== confirmPassword) {
        return { valid: false, message: 'Passwords do not match' };
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
        return { valid: false, message: 'Password must be at least 6 characters long and contain both letters and numbers' };
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

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
        return { valid: false, message: 'Password must be at least 6 characters long and contain both letters and numbers' };
    }
    return { valid: true };
};

export const validateAnswer = (data) => {
    const { description } = data;
    if (!description) {
        return { valid: false, message: 'Description is required' };
    }
    return { valid: true };
};

export const validateQuestion = (data) => {
    const { title, description } = data;
    if (!title) {
        return { valid: false, message: 'Title is required' };
    }
    if (!description) {
        return { valid: false, message: 'Description is required' };
    }
    return { valid: true };
};

