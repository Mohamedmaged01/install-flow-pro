import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient, private toast: ToastService) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwt_token');
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
        let httpParams = new HttpParams();
        if (params) {
            for (const [key, val] of Object.entries(params)) {
                if (val !== undefined && val !== null && val !== '') {
                    httpParams = httpParams.set(key, String(val));
                }
            }
        }
        return this.http
            .get<ApiResponse<T>>(`${this.baseUrl}${path}`, { headers: this.getHeaders(), params: httpParams })
            .pipe(
                map(res => {
                    if (!res.succeeded) {
                        const errMsg = res.errors?.join(', ') || res.message || 'خطأ غير معروف';
                        this.toast.error('خطأ', errMsg);
                        throw new Error(errMsg);
                    }
                    return res.data;
                }),
                catchError(err => {
                    if (err.status === 401) {
                        this.toast.error('غير مصرح', 'يرجى تسجيل الدخول');
                    } else if (err.status !== 0) {
                        this.toast.error('خطأ في الاتصال', err.message || 'تعذر الاتصال بالخادم');
                    }
                    return throwError(() => err);
                })
            );
    }

    post<T>(path: string, body: any): Observable<T> {
        return this.http
            .post<ApiResponse<T>>(`${this.baseUrl}${path}`, body, { headers: this.getHeaders() })
            .pipe(
                map(res => {
                    if (!res.succeeded) {
                        const errMsg = res.errors?.join(', ') || res.message || 'خطأ غير معروف';
                        this.toast.error('خطأ', errMsg);
                        throw new Error(errMsg);
                    }
                    return res.data;
                }),
                catchError(err => {
                    if (err.status === 401) {
                        this.toast.error('غير مصرح', 'يرجى تسجيل الدخول');
                    } else if (err.status !== 0) {
                        this.toast.error('خطأ', err.error?.message || 'فشل العملية');
                    }
                    return throwError(() => err);
                })
            );
    }

    upload<T>(path: string, formData: FormData): Observable<T> {
        const token = localStorage.getItem('jwt_token');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        // No Content-Type — browser sets multipart boundary
        return this.http
            .post<ApiResponse<T>>(`${this.baseUrl}${path}`, formData, { headers })
            .pipe(
                map(res => {
                    if (!res.succeeded) {
                        throw new Error(res.errors?.join(', ') || res.message);
                    }
                    return res.data;
                }),
                catchError(err => {
                    this.toast.error('خطأ', err.error?.message || 'فشل الرفع');
                    return throwError(() => err);
                })
            );
    }

    delete<T>(path: string): Observable<T> {
        return this.http
            .delete<ApiResponse<T>>(`${this.baseUrl}${path}`, { headers: this.getHeaders() })
            .pipe(
                map(res => {
                    if (!res.succeeded) {
                        const errMsg = res.errors?.join(', ') || res.message || 'خطأ غير معروف';
                        this.toast.error('خطأ', errMsg);
                        throw new Error(errMsg);
                    }
                    return res.data;
                }),
                catchError(err => {
                    if (err.status === 401) {
                        this.toast.error('غير مصرح', 'يرجى تسجيل الدخول');
                    } else if (err.status !== 0) {
                        this.toast.error('خطأ', err.error?.message || 'فشل الحذف');
                    }
                    return throwError(() => err);
                })
            );
    }
}
