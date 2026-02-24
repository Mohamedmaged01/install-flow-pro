import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { LucideAngularModule, FileText, Receipt, Plus, Search, RefreshCw } from 'lucide-angular';

// Documents (quotations/invoices) do not yet have a dedicated API endpoint.
// This page will show an informational placeholder until the API is available.

@Component({
    selector: 'app-documents',
    standalone: true,
    imports: [LucideAngularModule],
    templateUrl: './documents.html',
})
export class Documents {
    readonly FileText = FileText;
    readonly Receipt = Receipt;
    readonly Plus = Plus;
    readonly Search = Search;
    readonly RefreshCw = RefreshCw;

    constructor(
        private router: Router,
        private toast: ToastService,
    ) { }

    createOrder() {
        this.router.navigate(['/orders/create']);
    }
}
