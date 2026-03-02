/**
 * APEX ERP Gate API — TypeScript Models
 * Gate URL: https://gate.erp-apex.com/
 */

// ─── Generic Response Wrapper ───
export interface ApexResponse<T> {
    isSuccess: boolean;
    message: string;
    data: T;
}

// ─── Customer ───
export interface ApexCustomer {
    code: string;
    arabicName: string;
    latinName: string;
    phone: string | null;
    email: string;
    addressAr: string;
}

// ─── Line Item ───
export interface ApexItem {
    itemCode: string;
    arabicName: string;
    latinName: string;
    quantity: number;
    price: number;
    discountValue: number;
    vatValue: number;
}

// ─── Document (Invoice or Offer Price) ───
export interface ApexDocument {
    code: string;
    invoiceDate: string;
    totalDiscountValue: number;
    totalVat: number;
    net: number;
    customer: ApexCustomer;
    items: ApexItem[];
}

// ─── Request Params ───
export interface ApexQueryParams {
    PageNumber: number;
    PageSize: number;
    DateFrom?: string;
    DateTo?: string;
}
