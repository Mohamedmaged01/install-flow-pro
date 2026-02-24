import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class HomeService {
    constructor(private api: ApiService) { }

    getRoles(): Observable<any[]> {
        return this.api.get<any[]>('/Home/roles');
    }

    getTaskStatuses(): Observable<any[]> {
        return this.api.get<any[]>('/Home/taskStatus');
    }
}
