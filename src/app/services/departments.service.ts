import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiDepartment, AddDepartmentDto, ApiDepartmentUser } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
    constructor(private api: ApiService) { }

    getByBranch(branchId: number): Observable<ApiDepartment[]> {
        return this.api.get<ApiDepartment[]>('/Departments', { branchId });
    }

    getUsers(branchId: number, departmentId: number): Observable<ApiDepartmentUser[]> {
        return this.api.get<ApiDepartmentUser[]>('/Departments/users', { branchId, departmentId });
    }

    create(dto: AddDepartmentDto): Observable<any> {
        return this.api.post('/Departments', dto);
    }

    addUser(formData: FormData): Observable<any> {
        return this.api.upload('/Departments/user', formData);
    }
}
