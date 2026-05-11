import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css' // Note: Angular 17 uses styleUrl
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.registerForm.valid && !this.isLoading) {
            this.isLoading = true;
            this.errorMessage = '';
            this.successMessage = '';
            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.successMessage = 'Registration successful! Redirecting to login...';
                    setTimeout(() => this.router.navigate(['/login']), 2000);
                },
                error: (err) => {
                    this.errorMessage = err.error?.message || 'Registration failed.';
                    this.isLoading = false;
                }
            });
        }
    }
}
