import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
    constructor(private api: ApiService) { }

    get(branchId?: number): Observable<any> {
        const params: Record<string, string | number> = {};
        if (branchId) params['branchId'] = branchId;
        return this.api.get<any>('/Statistics', params);
    }
}
