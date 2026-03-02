import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApexDocument, ApexResponse } from '../../models/apex-models';
import { formatDateUTC3 } from '../../utils/date-utils';
import {
    LucideAngularModule, FileText, Receipt, Plus, Search, RefreshCw,
    ChevronRight, ChevronLeft, Eye, Calendar, Package, Filter
} from 'lucide-angular';

type DocTab = 'offers' | 'invoices';

@Component({
    selector: 'app-documents',
    standalone: true,
    imports: [LucideAngularModule, FormsModule],
    templateUrl: './documents.html',
})
export class Documents implements OnInit {
    readonly FileText = FileText;
    readonly Receipt = Receipt;
    readonly Plus = Plus;
    readonly Search = Search;
    readonly RefreshCw = RefreshCw;
    readonly ChevronRight = ChevronRight;
    readonly ChevronLeft = ChevronLeft;
    readonly Eye = Eye;
    readonly CalendarIcon = Calendar;
    readonly Package = Package;
    readonly Filter = Filter;
    readonly formatDateUTC3 = formatDateUTC3;

    activeTab: DocTab = 'offers';

    // Data
    documents: ApexDocument[] = [];
    isLoading = false;
    loadError = '';

    // Pagination
    currentPage = 1;
    hasMorePages = true;

    // Filters
    dateFrom = '';
    dateTo = '';
    searchQuery = '';

    // Expanded row
    expandedCode: string | null = null;

    constructor(
        private http: HttpClient,
        private router: Router,
    ) { }

    ngOnInit() {
        this.loadDocuments();
    }

    // ─── Tab switching ───
    switchTab(tab: DocTab) {
        if (tab === this.activeTab) return;
        this.activeTab = tab;
        this.currentPage = 1;
        this.expandedCode = null;
        this.loadDocuments();
    }

    // ─── Load (direct HttpClient call) ───
    loadDocuments() {
        this.isLoading = true;
        this.loadError = '';
        this.expandedCode = null;

        const endpoint = this.activeTab === 'invoices' ? '/api/invoices' : '/api/offers';

        let params = new HttpParams()
            .set('PageNumber', this.currentPage)
            .set('PageSize', 20);

        if (this.dateFrom) params = params.set('DateFrom', this.dateFrom);
        if (this.dateTo) params = params.set('DateTo', this.dateTo);

        this.http.get<ApexResponse<ApexDocument[]>>(endpoint, { params }).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    this.documents = res.data ?? [];
                } else {
                    this.documents = [];
                    this.loadError = res.message || 'APEX returned an error';
                }
                this.hasMorePages = this.documents.length >= 20;
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                this.loadError = err?.error?.message || err?.message || 'خطأ غير معروف';
                this.documents = [];
            },
        });
    }

    refresh() {
        this.loadDocuments();
    }

    // ─── Pagination ───
    nextPage() {
        if (!this.hasMorePages) return;
        this.currentPage++;
        this.loadDocuments();
    }

    prevPage() {
        if (this.currentPage <= 1) return;
        this.currentPage--;
        this.loadDocuments();
    }

    // ─── Filter ───
    applyFilter() {
        this.currentPage = 1;
        this.loadDocuments();
    }

    clearFilter() {
        this.dateFrom = '';
        this.dateTo = '';
        this.searchQuery = '';
        this.currentPage = 1;
        this.loadDocuments();
    }

    // ─── Search (client-side on current page) ───
    get filteredDocuments(): ApexDocument[] {
        if (!this.searchQuery.trim()) return this.documents;
        const q = this.searchQuery.trim().toLowerCase();
        return this.documents.filter(d =>
            d.code.toLowerCase().includes(q) ||
            d.customer?.arabicName?.toLowerCase().includes(q) ||
            d.customer?.latinName?.toLowerCase().includes(q) ||
            d.customer?.code?.toLowerCase().includes(q)
        );
    }

    // ─── Expand / Collapse rows ───
    toggleExpand(code: string) {
        this.expandedCode = this.expandedCode === code ? null : code;
    }

    isExpanded(code: string): boolean {
        return this.expandedCode === code;
    }

    // ─── Navigate to create order from document ───
    createOrderFromDoc(doc: ApexDocument) {
        const isInvoice = this.activeTab === 'invoices';
        this.router.navigate(['/orders/create'], {
            queryParams: {
                quotationId: isInvoice ? '' : doc.code,
                invoiceId: isInvoice ? doc.code : '',
                customerId: doc.customer?.code ?? '',
                customerName: doc.customer?.arabicName ?? '',
                apexNet: doc.net,
                apexCode: doc.code,
            },
        });
    }

    createOrder() {
        this.router.navigate(['/orders/create']);
    }

    // ─── Helpers ───
    get tabLabel(): string {
        return this.activeTab === 'invoices' ? 'الفواتير' : 'عروض الأسعار';
    }

    formatCurrency(val: number): string {
        return val?.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00';
    }

    formatApexDate(dateStr: string): string {
        if (!dateStr) return '—';
        const match = dateStr.match(/(\d{4}\/\d{1,2}\/\d{1,2})/);
        if (match) {
            return match[1].replace(/\//g, '-');
        }
        return formatDateUTC3(dateStr);
    }
}
