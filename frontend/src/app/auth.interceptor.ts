import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, finalize } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);

    // Ensure credentials (cookies) are sent with every request
    const clonedReq = req.clone({ withCredentials: true });

    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If 401 and not on auth endpoints
            if (
                error.status === 401 &&
                !req.url.includes('/api/auth/login') &&
                !req.url.includes('/api/auth/register') &&
                !req.url.includes('/api/auth/refresh')
            ) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshTokenSubject.next(null);

                    return authService.refreshToken().pipe(
                        switchMap((res) => {
                            isRefreshing = false;
                            refreshTokenSubject.next(true); // Notify waiting requests
                            return next(clonedReq);
                        }),
                        catchError((refreshError) => {
                            isRefreshing = false;
                            refreshTokenSubject.next(false); // Notify failure
                            authService.logout().subscribe();
                            return throwError(() => refreshError);
                        })
                    );
                } else {
                    // Wait for refresh to finish then retry
                    return refreshTokenSubject.pipe(
                        filter(result => result !== null),
                        take(1),
                        switchMap(success => {
                            if (success) {
                                return next(clonedReq);
                            }
                            return throwError(() => error);
                        })
                    );
                }
            }

            return throwError(() => error);
        })
    );
};
