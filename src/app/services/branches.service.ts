import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiBranch, AddBranchDto } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class BranchesService {
    constructor(private api: ApiService) { }

    getAll(): Observable<ApiBranch[]> {
        return this.api.get<ApiBranch[]>('/Branches');
    }

    create(dto: AddBranchDto): Observable<any> {
        return this.api.post('/Branches', dto);
    }
}
