import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface AuthUser {
    username: string;
    roles: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/api/auth';
    private currentUser = new BehaviorSubject<AuthUser | null>(null);
    private initialized = false;

    currentUser$ = this.currentUser.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    /**
     * Initialize auth state by checking with the server.
     * Called once on app startup.
     */
    init(): Observable<boolean> {
        if (this.initialized) {
            return of(this.currentUser.value !== null);
        }

        return this.http.get<AuthUser>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
            tap(user => {
                this.currentUser.next(user);
                this.initialized = true;
            }),
            map(() => true),
            catchError(() => {
                this.currentUser.next(null);
                this.initialized = true;
                return of(false);
            })
        );
    }

    login(credentials: any): Observable<AuthUser> {
        return this.http.post<AuthUser>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
            tap((user: AuthUser) => {
                this.currentUser.next(user);
                this.initialized = true;
            })
        );
    }

    register(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, user, { withCredentials: true });
    }

    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.currentUser.next(null);
                this.initialized = false;
                this.router.navigate(['/login']);
            }),
            catchError(() => {
                this.currentUser.next(null);
                this.initialized = false;
                this.router.navigate(['/login']);
                return of(null);
            })
        );
    }

    refreshToken(): Observable<any> {
        return this.http.post(`${this.apiUrl}/refresh`, {}, { withCredentials: true });
    }

    isLoggedIn(): boolean {
        return this.currentUser.value !== null;
    }

    getUsername(): string | null {
        return this.currentUser.value?.username ?? null;
    }

    getRoles(): string[] {
        return this.currentUser.value?.roles ?? [];
    }
}
