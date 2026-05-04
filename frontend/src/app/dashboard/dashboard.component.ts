import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../log.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
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
        private router: Router,
        private cdr: ChangeDetectorRef
    ) { }
    
    private refreshSubscription?: Subscription;

    ngOnInit(): void {
        this.username = this.authService.getUsername();
        
        // Initial load
        this.loadLogs();
        
        // Setup robust polling using RxJS
        // timer(delay, period) - wait 1s, then every 1s
        this.refreshSubscription = timer(1000, 1000).pipe(
            switchMap(() => {
                // Only fetch if we are on the first page and no filters are active (or as desired)
                // For now, mirroring existing logic: only if page === 0
                if (this.page === 0) {
                    return this.logService.getLogs(
                        this.page,
                        this.size,
                        this.levelFilter || undefined,
                        this.sourceFilter || undefined,
                        this.searchQuery || undefined,
                        this.startDate ? new Date(this.startDate).toISOString() : undefined,
                        this.endDate ? new Date(this.endDate).toISOString() : undefined
                    );
                }
                return []; // Return empty if not on first page
            })
        ).subscribe({
            next: (data: any) => {
                if (data && data.content) {
                    this.logs = data.content;
                    this.totalPages = data.totalPages;
                    this.cdr.markForCheck(); // Ensure Angular checks for changes
                }
            },
            error: (err) => console.error('Error in auto-refresh', err)
        });
    }

    ngOnDestroy(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
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
                    this.cdr.markForCheck();
                },
                error: (err) => console.error('Error fetching logs', err)
            });
    }

    trackByLogId(index: number, log: any): number {
        return log.id;
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
        this.authService.logout().subscribe();
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
