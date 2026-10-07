import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { map } from 'rxjs/internal/operators/map';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  changePassword(currentPassword: string, newPassword: string): Observable<string> {
    const payload = { currentPassword, newPassword };
    return this.withCsrf(() => this.http.patch<string>(`/users/${this.auth.currentUser()?.userId}/password`, payload));
  }

    /** Ensures the XSRF-TOKEN cookie is set before a state-changing request. */
      private withCsrf<T>(request: () => Observable<T>): Observable<T> {
        return this.http.get(`api/auth/csrf`).pipe(
          map(() => undefined),
          switchMap(request)
        );
      }
}
