import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../log.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    logs: any[] = [];
    page = 0;
    size = 10;
    totalPages = 0;

    // Filters
    levelFilter = '';
    sourceFilter = '';
    searchQuery = '';
    startDate = '';
    endDate = '';

    username: string | null = '';

    constructor(
        private logService: LogService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.username = this.authService.getUsername();
        this.loadLogs();
    }

    loadLogs(): void {
        this.logService.getLogs(
            this.page,
            this.size,
            this.levelFilter || undefined,
            this.sourceFilter || undefined,
            this.searchQuery || undefined,
            this.startDate ? new Date(this.startDate).toISOString() : undefined,
            this.endDate ? new Date(this.endDate).toISOString() : undefined
        )
            .subscribe({
                next: (data) => {
                    this.logs = data.content;
                    this.totalPages = data.totalPages;
                },
                error: (err) => console.error('Error fetching logs', err)
            });
    }

    onFilterChange(): void {
        this.page = 0;
        this.loadLogs();
    }

    nextPage(): void {
        if (this.page < this.totalPages - 1) {
            this.page++;
            this.loadLogs();
        }
    }

    prevPage(): void {
        if (this.page > 0) {
            this.page--;
            this.loadLogs();
        }
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    // Method to simulate adding a log (for testing)
    addTestLog(): void {
        const log = {
            level: 'INFO',
            source: 'frontend-test',
            message: 'Test log from dashboard at ' + new Date().toISOString()
        };
        this.logService.createLog(log).subscribe(() => this.loadLogs());
    }
}
