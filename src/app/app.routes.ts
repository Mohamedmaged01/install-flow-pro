import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Documents } from './pages/documents/documents';
import { Orders } from './pages/orders/orders';
import { OrderCreate } from './pages/orders/order-create/order-create';
import { OrderDetail } from './pages/orders/order-detail/order-detail';
import { Schedule } from './pages/schedule/schedule';
import { ScanQR } from './pages/scan-qr/scan-qr';
import { Reports } from './pages/reports/reports';
import { Settings } from './pages/settings/settings';
import { Tasks } from './pages/tasks/tasks';
import { authGuard } from './auth.guard';


export const routes: Routes = [
    { path: 'login', component: Login },
    {
        path: '',
        component: Layout,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            { path: 'documents', component: Documents },
            { path: 'orders/create', component: OrderCreate },
            { path: 'orders/:id/edit', component: OrderCreate },
            { path: 'orders/:id', component: OrderDetail },
            { path: 'jobs', component: Orders },
            { path: 'tasks', component: Tasks },
            { path: 'schedule', component: Schedule },
            { path: 'scan-qr', component: ScanQR },
            { path: 'reports', component: Reports },
            { path: 'settings', component: Settings },
        ]
    }
];

