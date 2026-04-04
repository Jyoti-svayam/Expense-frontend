import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private toastr: ToastrService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(req.url.includes('/login') || req.url.includes('/signup')){
      return next.handle(req);
    }
    const token = localStorage.getItem('token');

    let authReq = req;

    // ✅ Attach token
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        // 🔥 Handle unauthorized
        if (error.status === 401) {
          localStorage.removeItem('accessToken');

          this.toastr.error('Session expired, please login again');

          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}