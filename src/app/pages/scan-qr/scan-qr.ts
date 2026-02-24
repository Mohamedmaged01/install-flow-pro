import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { OrdersService } from '../../services/orders.service';
import { LucideAngularModule, QrCode, Camera, CheckCircle, XCircle, ScanLine, Video, VideoOff } from 'lucide-angular';

@Component({
    selector: 'app-scan-qr',
    standalone: true,
    imports: [LucideAngularModule, FormsModule],
    templateUrl: './scan-qr.html',
})
export class ScanQR implements OnDestroy {
    readonly QrCode = QrCode;
    readonly Camera = Camera;
    readonly CheckCircle = CheckCircle;
    readonly XCircle = XCircle;
    readonly ScanLine = ScanLine;
    readonly Video = Video;
    readonly VideoOff = VideoOff;

    qrInput = '';
    scanResult: 'idle' | 'scanning' | 'success' | 'failed' = 'idle';
    matchedOrderId: number | null = null;
    matchedOrderNumber = '';
    cameraActive = false;
    cameraError = '';
    private html5QrScanner: any = null;

    constructor(
        private auth: AuthService,
        private router: Router,
        private toast: ToastService,
        private ordersService: OrdersService,
    ) { }

    async startCameraScan() {
        this.cameraError = '';
        this.cameraActive = true;
        this.scanResult = 'scanning';

        try {
            // Dynamic import to avoid SSR issues
            const { Html5Qrcode } = await import('html5-qrcode');
            this.html5QrScanner = new Html5Qrcode('qr-reader');

            await this.html5QrScanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText: string) => {
                    // Success callback
                    this.qrInput = decodedText;
                    this.stopCamera();
                    this.verifyScan();
                },
                () => { /* ignore errors during scanning */ }
            );
        } catch (err: any) {
            this.cameraActive = false;
            this.scanResult = 'idle';
            this.cameraError = 'تعذر الوصول للكاميرا. تأكد من الأذونات أو استخدم الإدخال اليدوي.';
            this.toast.error('خطأ في الكاميرا', this.cameraError);
        }
    }

    async stopCamera() {
        if (this.html5QrScanner) {
            try {
                await this.html5QrScanner.stop();
                this.html5QrScanner.clear();
            } catch { }
            this.html5QrScanner = null;
        }
        this.cameraActive = false;
    }

    manualVerify() {
        if (!this.qrInput.trim()) return;
        this.scanResult = 'scanning';
        setTimeout(() => this.verifyScan(), 500);
    }

    private verifyScan() {
        const parts = this.qrInput.trim().split(':');
        // Expected token format from backend: "orderId:token" or just the raw token
        // The API requires both orderId and token — we attempt to parse orderId from scanned text
        const orderId = parts.length === 2 ? parseInt(parts[0], 10) : NaN;
        const token = parts.length === 2 ? parts[1] : this.qrInput.trim();

        if (isNaN(orderId)) {
            this.scanResult = 'failed';
            this.toast.error('QR غير صالح', 'تنسيق رمز QR غير معروف');
            return;
        }

        this.ordersService.verifyQr({ orderId, token }).subscribe({
            next: (res) => {
                this.scanResult = 'success';
                this.matchedOrderId = orderId;
                this.matchedOrderNumber = `IO-${orderId}`;
                this.toast.success('تم التحقق', `تم إغلاق الأمر IO-${orderId} بنجاح`);
            },
            error: () => {
                this.scanResult = 'failed';
                this.matchedOrderId = null;
                this.matchedOrderNumber = '';
                this.toast.error('فشل التحقق', 'رمز QR غير صالح أو الأمر ليس بحالة تسمح بالإغلاق');
            },
        });
    }

    reset() {
        this.scanResult = 'idle';
        this.qrInput = '';
        this.matchedOrderNumber = '';
        this.cameraError = '';
    }

    viewOrder() {
        if (this.matchedOrderId) {
            this.router.navigate(['/orders', this.matchedOrderId]);
        }
    }

    ngOnDestroy() {
        this.stopCamera();
    }
}
