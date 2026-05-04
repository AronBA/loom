import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If already initialized and logged in, allow immediately
    if (authService.isLoggedIn()) {
        return true;
    }

    // Otherwise, check with the server
    return authService.init().pipe(
        map(isLoggedIn => {
            if (isLoggedIn) {
                return true;
            }
            return router.parseUrl('/login');
        })
    );
};

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
