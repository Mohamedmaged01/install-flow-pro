/**
 * APEX ERP Gate Service
 * URL: https://gate.erp-apex.com/
 * Specs: 1-min cache, max 10 req/s, page size 20
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApexResponse, ApexDocument, ApexQueryParams } from '../models/apex-models';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL_MS = 60_000; // 1 minute

@Injectable({ providedIn: 'root' })
export class ApexService {
    private cache = new Map<string, CacheEntry<any>>();

    constructor(private http: HttpClient) { }

    // ─── Public API ───

    getInvoices(page = 1, dateFrom?: string, dateTo?: string): Observable<ApexDocument[]> {
        return this.apexGet<ApexDocument[]>('InvoiceServices/GetInvoices', page, dateFrom, dateTo);
    }

    getOfferPrices(page = 1, dateFrom?: string, dateTo?: string): Observable<ApexDocument[]> {
        return this.apexGet<ApexDocument[]>('OfferPricesController/getOfferPrice', page, dateFrom, dateTo);
    }

    // ─── Internal ───

    private apexGet<T>(path: string, page: number, dateFrom?: string, dateTo?: string): Observable<T> {
        const cacheKey = `${path}|p=${page}|df=${dateFrom ?? ''}|dt=${dateTo ?? ''}`;

        // Return cached if fresh
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return of(cached.data as T);
        }

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        let params = new HttpParams()
            .set('PassKey', environment.apexPassKey)
            .set('PageNumber', page)
            .set('PageSize', 20);

        if (dateFrom) params = params.set('DateFrom', dateFrom);
        if (dateTo) params = params.set('DateTo', dateTo);

        return this.http
            .get<ApexResponse<T>>(`${environment.apexUrl}/${path}`, { headers, params })
            .pipe(
                map(res => {
                    if (!res.isSuccess) {
                        throw new Error(res.message || 'APEX API error');
                    }
                    return res.data;
                }),
                tap(data => {
                    this.cache.set(cacheKey, { data, timestamp: Date.now() });
                }),
                catchError(err => {
                    console.error(`[ApexService] ${path} failed:`, err);
                    return throwError(() => err);
                }),
            );
    }

    /** Clear the cache (e.g. on manual refresh) */
    clearCache() {
        this.cache.clear();
    }
}
