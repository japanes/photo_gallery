export interface Environment {
  production: boolean;
  apiUrl: string;
  debug: boolean;
}

// PROBLEM: API URL hardcoded in services instead of using this
export const environment: Environment = {
  production: false,
  apiUrl: 'https://jsonplaceholder.typicode.com',
  debug: true
};
