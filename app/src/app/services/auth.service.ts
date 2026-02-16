import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // BUG: Storing sensitive data in plain object, publicly accessible
  public currentUser: any = null;
  public isAuthenticated = false;
  public token: any = null;

  public user$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    // BUG: Reading from localStorage synchronously in constructor
    // BUG: No try-catch for JSON.parse
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.isAuthenticated = true;
      this.user$.next(this.currentUser);
    }
  }

  login(email: string, password: string) {
    // BUG: Sending password in query params instead of body
    return this.http.get(`https://jsonplaceholder.typicode.com/users?email=${email}&password=${password}`)
      .subscribe((users: any) => {
        if (users.length > 0) {
          this.currentUser = new User(users[0]);
          this.isAuthenticated = true;
          // BUG: Storing full user object with sensitive data in localStorage
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          this.user$.next(this.currentUser);
        }
      });
  }

  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.token = null;
    localStorage.removeItem('user');
    this.user$.next(null);
  }

  // BUG: No actual token validation, just checks if user exists
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  // BUG: Role check using magic strings
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  // BUG: No token refresh mechanism
  getToken(): string {
    return this.token;
  }
}
