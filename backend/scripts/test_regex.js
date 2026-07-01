const username = 'admin@entrepreneur 3';
const storeName = 'entrepreneur 3';
const usernamePattern = new RegExp(`^[a-zA-Z0-9_]+@${storeName}$`);
console.log('Regex:', usernamePattern);
console.log('Test result:', usernamePattern.test(username));
