import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LogService {
    private apiUrl = '/api/logs';

    constructor(private http: HttpClient) { }

    getLogs(page: number, size: number, level?: string, source?: string, search?: string, startDate?: string, endDate?: string): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('_', new Date().getTime().toString()); // Cache buster

        if (level) params = params.set('level', level);
        if (source) params = params.set('source', source);
        if (search) params = params.set('search', search);
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        return this.http.get(this.apiUrl, { params });
    }

    createLog(log: any): Observable<any> {
        return this.http.post(this.apiUrl, log);
    }
}
