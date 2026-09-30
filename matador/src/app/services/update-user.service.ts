import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';  
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { map } from 'rxjs/internal/operators/map';

export interface UserPayload {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateUserService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  updateUser(payload: UserPayload) {
    return this.withCsrf(() => this.http.put<UserPayload>(`/users/${this.auth.currentUser()?.userId}`, payload));
  }

    /** Ensures the XSRF-TOKEN cookie is set before a state-changing request. */
    private withCsrf<T>(request: () => Observable<T>): Observable<T> {
      return this.http.get(`api/auth/csrf`).pipe(
        map(() => undefined),
        switchMap(request)
      );
    }

}
