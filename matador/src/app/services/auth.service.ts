import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';

export interface AuthUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleType: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

const API = '/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly user = signal<AuthUser | null>(null);
  readonly currentUser = this.user.asReadonly();

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.withCsrf(() => this.http.post<AuthUser>(`${API}/register`, payload));
  }

  login(payload: LoginPayload): Observable<AuthUser> {
    return this.withCsrf(() => this.http.post<AuthUser>(`${API}/login`, payload)).pipe(
      tap((user) => this.user.set(user))
    );
  }

  logout(): Observable<void> {
    return this.withCsrf(() => this.http.post<void>(`${API}/logout`, {})).pipe(
      catchError(() => of(undefined)),
      tap(() => this.clearUser())
    );
  }

  /** Checks the server-side session; resolves to null when not signed in or expired. */
  fetchCurrentUser(): Observable<AuthUser | null> {
    return this.http.get<AuthUser>(`${API}/me`).pipe(
      catchError(() => of(null)),
      tap((user) => this.user.set(user))
    );
  }

  clearUser(): void {
    this.user.set(null);
  }

  /** Ensures the XSRF-TOKEN cookie is set before a state-changing request. */
  private withCsrf<T>(request: () => Observable<T>): Observable<T> {
    return this.http.get(`${API}/csrf`).pipe(
      map(() => undefined),
      switchMap(request)
    );
  }
}
