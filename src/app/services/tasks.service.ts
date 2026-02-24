import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiTask, AssignTaskDto, TaskStatusUpdateDto } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class TasksService {
    constructor(private api: ApiService) { }

    /**
     * GET /api/Tasks/tasks
     * Returns all assigned tasks (filterable by role server-side).
     */
    getAll(): Observable<ApiTask[]> {
        return this.api.get<ApiTask[]>('/Tasks/tasks');
    }

    /**
     * POST /api/Tasks
     * Assigns a task to a technician for a given order.
     */
    assign(dto: AssignTaskDto): Observable<any> {
        return this.api.post('/Tasks', dto);
    }

    /**
     * POST /api/Tasks/{id}/status
     * Updates the status of an existing task (e.g. Accepted → Enroute → Onsite → Completed).
     */
    updateStatus(id: number, dto: TaskStatusUpdateDto): Observable<any> {
        return this.api.post(`/Tasks/${id}/status`, dto);
    }
}
