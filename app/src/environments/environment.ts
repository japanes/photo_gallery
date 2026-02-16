// PROBLEM: No type definition for environment
// PROBLEM: API URL hardcoded in services instead of using this
export const environment = {
  production: false,
  apiUrl: 'https://jsonplaceholder.typicode.com',
  // BUG: Debug flag exists but nothing uses it
  debug: true
};
