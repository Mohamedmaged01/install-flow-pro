import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserRole } from './models';

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.isLoggedIn()) {
        return true;
    }
    return router.createUrlTree(['/login']);
};

/** Only Admin and Sales Manager can access the dashboard */
export const dashboardGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.userRole();
    if (role === UserRole.ADMIN || role === UserRole.SALES_MANAGER) {
        return true;
    }
    return router.createUrlTree(['/jobs']);
};

/** Redirect to the correct default page based on role */
export const defaultRedirectGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.userRole();
    if (role === UserRole.ADMIN || role === UserRole.SALES_MANAGER) {
        return router.createUrlTree(['/dashboard']);
    }
    return router.createUrlTree(['/jobs']);
};
