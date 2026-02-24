import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiOrder, AddOrderDto, ApiOrderStatus, ApiOrderHistoryEntry, VerifyQrDto, OrderActionDto } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
    constructor(private api: ApiService) { }

    getAll(filters?: { branchId?: number; departmentId?: number; status?: ApiOrderStatus }): Observable<ApiOrder[]> {
        const params: Record<string, string | number> = {};
        if (filters?.branchId) params['branchId'] = filters.branchId;
        if (filters?.departmentId) params['departmentId'] = filters.departmentId;
        if (filters?.status) params['status'] = filters.status;
        return this.api.get<ApiOrder[]>('/Orders', params);
    }

    create(dto: AddOrderDto): Observable<any> {
        return this.api.post('/Orders', dto);
    }

    deleteAll(): Observable<any> {
        return this.api.delete('/Orders');
    }

    /**
     * GET /api/Orders/{id}/history
     * Returns the full audit/history trail for a specific order.
     */
    getHistory(orderId: number): Observable<ApiOrderHistoryEntry[]> {
        return this.api.get<ApiOrderHistoryEntry[]>(`/Orders/${orderId}/history`);
    }

    /**
     * POST /api/Orders/verify-qr
     * Verifies the QR token scanned at an installation site.
     */
    verifyQr(dto: VerifyQrDto): Observable<any> {
        return this.api.post('/Orders/verify-qr', dto);
    }

    /**
     * POST /api/Orders/evidence  (multipart/form-data)
     * Uploads evidence photos and an optional note for an order.
     * FormData fields: OrderId (int), Images (binary[]), Note (string)
     */
    addEvidence(formData: FormData): Observable<any> {
        return this.api.upload('/Orders/evidence', formData);
    }

    /**
     * POST /api/Orders/{id}/handle
     * Advances an order through its workflow (e.g. approve, reject, complete).
     * Used by SalesManager, Supervisor, and other roles to transition order status.
     */
    handleOrder(id: number, dto: OrderActionDto): Observable<any> {
        return this.api.post(`/Orders/${id}/handle`, dto);
    }
}
