import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Sends the user back to sign in when their session has expired or been revoked. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && req.url.startsWith('/api/') && !req.url.startsWith('/api/auth/')) {
        auth.clearUser();
        router.navigate(['/sign-in'], { queryParams: { expired: true } });
      }
      return throwError(() => error);
    })
  );
};
