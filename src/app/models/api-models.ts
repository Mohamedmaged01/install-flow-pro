/**
 * Backend API DTOs and Enums
 * Aligned with: http://apiinstallationorders.runasp.net/swagger/v1/swagger.json
 */

// ─── Task Status Enum (Backend) ───
export enum ApiTaskStatus {
    Assigned = 'Assigned',
    Accepted = 'Accepted',
    Enroute = 'Enroute',
    Onsite = 'Onsite',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Returned = 'Returned',
    OnHold = 'OnHold',
}

// ─── Generic API Response Wrapper ───
export interface ApiResponse<T> {
    succeeded: boolean;
    message: string;
    errors: string[] | null;
    data: T;
}

// ─── Enums (Backend) ───
export enum ApiOrderStatus {
    Draft = 'Draft',
    PendingSalesManager = 'PendingSalesManager',
    PendingSupervisor = 'PendingSupervisor',
    InProgress = 'InProgress',
    PendingQR = 'PendingQR',
    Completed = 'Completed',
    Closed = 'Closed',
    Returned = 'Returned',
    Cancelled = 'Cancelled',
}

export enum ApiRole {
    SuperAdmin = 'SuperAdmin',
    Admin = 'Admin',
    SalesManager = 'SalesManager',
    DepartmentManager = 'DepartmentManager',
    Supervisor = 'Supervisor',
    SalesRepresentative = 'SalesRepresentative',
    Technician = 'Technician',
    Customer = 'Customer',
}

// ─── Auth DTOs ───
export interface LoginDto {
    phoneOrEmail: string;
    password: string;
}

export interface LoginResponseDto {
    token: string;
    role: ApiRole;
    name: string;
    userId: number;
    branchId?: number;
    departmentId?: number;
}

// ─── Branches ───
export interface ApiBranch {
    id: number;
    name: string;
    email: string;
    phone: string;
    departmentNames: string[];
}

export interface AddBranchDto {
    name: string;
    email: string;
    phone: string;
}

// ─── Departments ───
export interface ApiDepartment {
    id: number;
    name: string;
}

export interface AddDepartmentDto {
    branchId: number;
    name: string;
}

export interface ApiDepartmentUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: ApiRole;
    image?: string;
}

// ─── Priority (Backend) ───
export enum ApiPriority {
    Urgent = 'Urgent',
    Normal = 'Normal',
}

// ─── Items ───
export interface ApiItem {
    id: number;
    title: string;
    price: number;
}

export interface AddItemDto {
    title: string;
    price: number;
}

export interface OrderItemDto {
    id: number;
    qantity: number; // Note: matches Swagger typo
}

// ─── Orders ───
export interface ApiOrder {
    id: number;
    status: ApiOrderStatus;
    city: string;
    address: string;
    scheduledDate: string | null;
    qrToken: string | null;
    quotationId: string;
    invoiceId: string;
    customerId: string;
    branchId: number;
    departmentId: number;
}

export interface AddOrderDto {
    status: ApiOrderStatus;
    city: string;
    address: string;
    scheduledDate: string | null;
    quotationId: string;
    invoiceId: string;
    customerId: string;
    createdAt: string;
    salesApprovalDate: string | null;
    priority: ApiPriority;
    branchId: number;
    departmentId: number;
    createdByUserId: number;
    items: OrderItemDto[] | null;
}

// ─── Order History ───
export interface ApiOrderHistoryEntry {
    id: number;
    orderId: number;
    action: string;
    fromStatus: string | null;
    toStatus: string | null;
    userId: number;
    userName: string;
    userRole: string;
    timestamp: string;
    notes: string | null;
}

// ─── QR Verification ───
export interface VerifyQrDto {
    orderId: number;
    token: string;
}

// ─── Order Action (Handle) ───
export interface OrderActionDto {
    currentUserId: number;
    nextStatus: ApiOrderStatus;
    note?: string;
    role: ApiRole;
}

// ─── Tasks ───
export interface ApiTask {
    id: number;
    orderId: number;
    technicianId: number;
    technicianName: string;
    status: ApiTaskStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface AssignTaskDto {
    orderId: number;
    technicianId: number;
    notes: string;
}

export interface TaskStatusUpdateDto {
    newStatus: ApiTaskStatus;
    notes: string;
    imagePath?: string;
}

// ─── Roles ───
export interface ApiRoleOption {
    value: number;
    text: string;
}

// ─── Enum Mappers (Backend ↔ Frontend) ───
import { OrderStatus, UserRole } from './index';

export function apiStatusToFrontend(s: ApiOrderStatus): OrderStatus {
    switch (s) {
        case ApiOrderStatus.Draft: return OrderStatus.DRAFT;
        case ApiOrderStatus.PendingSalesManager: return OrderStatus.PENDING_APPROVAL;
        case ApiOrderStatus.PendingSupervisor: return OrderStatus.UNDER_REVIEW;
        case ApiOrderStatus.InProgress: return OrderStatus.IN_PROGRESS;
        case ApiOrderStatus.PendingQR: return OrderStatus.PENDING_QR;
        case ApiOrderStatus.Completed: return OrderStatus.COMPLETED;
        case ApiOrderStatus.Closed: return OrderStatus.CLOSED;
        case ApiOrderStatus.Returned: return OrderStatus.RETURNED;
        case ApiOrderStatus.Cancelled: return OrderStatus.CANCELLED;
        default: return OrderStatus.DRAFT;
    }
}

export function frontendStatusToApi(s: OrderStatus): ApiOrderStatus {
    switch (s) {
        case OrderStatus.DRAFT: return ApiOrderStatus.Draft;
        case OrderStatus.PENDING_APPROVAL: return ApiOrderStatus.PendingSalesManager;
        case OrderStatus.REJECTED: return ApiOrderStatus.Cancelled;
        case OrderStatus.UNDER_REVIEW: return ApiOrderStatus.PendingSupervisor;
        case OrderStatus.RETURNED: return ApiOrderStatus.Returned;
        case OrderStatus.READY_FOR_ASSIGNMENT: return ApiOrderStatus.PendingSupervisor;
        case OrderStatus.IN_PROGRESS: return ApiOrderStatus.InProgress;
        case OrderStatus.ON_HOLD: return ApiOrderStatus.InProgress;
        case OrderStatus.RETURNED_FROM_FIELD: return ApiOrderStatus.Returned;
        case OrderStatus.COMPLETED: return ApiOrderStatus.Completed;
        case OrderStatus.PENDING_QR: return ApiOrderStatus.PendingQR;
        case OrderStatus.CLOSED: return ApiOrderStatus.Closed;
        case OrderStatus.CANCELLED: return ApiOrderStatus.Cancelled;
        default: return ApiOrderStatus.Draft;
    }
}

export function apiRoleToFrontend(r: ApiRole): UserRole {
    switch (r) {
        case ApiRole.Admin: return UserRole.ADMIN;
        case ApiRole.SalesManager: return UserRole.SALES_MANAGER;
        case ApiRole.DepartmentManager: return UserRole.SUPERVISOR;
        case ApiRole.Supervisor: return UserRole.SUPERVISOR;
        case ApiRole.SalesRepresentative: return UserRole.SALES_REP;
        case ApiRole.Technician: return UserRole.TECHNICIAN;
        case ApiRole.Customer: return UserRole.ADMIN; // map to admin for now
        default: return UserRole.ADMIN;
    }
}
