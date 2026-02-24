import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiItem, AddItemDto } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class ItemsService {
    constructor(private api: ApiService) { }

    getAll(): Observable<ApiItem[]> {
        return this.api.get<ApiItem[]>('/Itemss');
    }

    create(dto: AddItemDto): Observable<any> {
        return this.api.post('/Itemss', dto);
    }
}
