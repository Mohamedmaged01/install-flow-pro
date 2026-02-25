import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { User, UserRole, ROLE_LABELS } from '../models';
import { MockDataService } from './mock-data.service';
import { LoginDto, ApiResponse, apiRoleToFrontend, ApiRole } from '../models/api-models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    // ─── TEST MODE: set to false to re-enable login ───
    private readonly TEST_MODE = false;
    private readonly TEST_USER: User = {
        id: '1',
        name: 'مدير النظام (تجريبي)',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
    };

    private currentUser = signal<User | null>(null);

    readonly user = this.currentUser.asReadonly();
    readonly isLoggedIn = computed(() => this.currentUser() !== null);
    readonly userRole = computed(() => this.currentUser()?.role ?? null);
    readonly userName = computed(() => this.currentUser()?.name ?? '');
    readonly userId = computed(() => {
        // First try the stored user object
        const storedId = parseInt(this.currentUser()?.id ?? '0');
        if (storedId && storedId !== 0) return storedId;
        // Fallback: decode the JWT directly to find the real user ID
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt_token') : null;
        if (token) {
            const claims = this.decodeJwt(token);
            const rawId =
                claims?.['Id'] ??
                claims?.['nameid'] ??
                claims?.['sub'] ??
                claims?.['uid'] ??
                claims?.['userId'] ??
                claims?.['UserId'] ??
                claims?.['user_id'] ??
                claims?.['id'] ??
                claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
            if (rawId != null) {
                const parsed = parseInt(String(rawId));
                if (!isNaN(parsed) && parsed !== 0) return parsed;
            }
        }
        return 0;
    });
    readonly roleLabel = computed(() => {
        const role = this.userRole();
        return role ? ROLE_LABELS[role] : '';
    });


    constructor(private data: MockDataService, private http: HttpClient) {
        if (this.TEST_MODE) {
            // Bypass all auth for testing
            this.currentUser.set(this.TEST_USER);
            return;
        }
        // Restore session
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('currentUserId') : null;
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt_token') : null;

        if (token) {
            const savedUser = localStorage.getItem('jwt_user');
            if (savedUser) {
                try {
                    const user: User = JSON.parse(savedUser);
                    // If stored ID is invalid, re-decode the JWT to get the real one
                    if (!user.id || user.id === '0' || user.id === 'api-user') {
                        const claims = this.decodeJwt(token);
                        const rawId =
                            claims?.['Id'] ??
                            claims?.['nameid'] ??
                            claims?.['sub'] ??
                            claims?.['uid'] ??
                            claims?.['userId'] ??
                            claims?.['UserId'] ??
                            claims?.['user_id'] ??
                            claims?.['id'] ??
                            claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                        if (rawId != null && String(rawId) !== '0') {
                            user.id = String(rawId);
                            localStorage.setItem('jwt_user', JSON.stringify(user));
                        }
                    }
                    this.currentUser.set(user);
                } catch { }
            }
        } else if (saved) {
            const user = this.data.getUserById(saved);
            if (user) this.currentUser.set(user);
        }
    }

    // ─── Decode JWT payload (no library needed) ───
    decodeJwt(token: string): Record<string, any> | null {
        try {
            const payload = token.split('.')[1];
            const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    // ─── API Login (phone + password → JWT) ───
    apiLogin(phoneOrEmail: string, password: string): Observable<boolean> {
        return this.http
            .post<ApiResponse<any>>(`${environment.apiUrl}/Auth/login`, { phoneOrEmail, password } as LoginDto)
            .pipe(
                map(res => {
                    if (res.succeeded && res.data) {
                        const tokenData = res.data;
                        // Store JWT
                        const token = tokenData.token || tokenData;
                        if (typeof token === 'string') {
                            localStorage.setItem('jwt_token', token);
                        }

                        // Always decode JWT to get real user ID — response body often has userId=0.
                        let userId = '0';
                        const claims = typeof token === 'string' ? this.decodeJwt(token) : null;
                        console.log('[AuthService] ALL JWT claims:', claims);

                        if (claims) {
                            // Try every common claim name ASP.NET Core uses for the user ID
                            const rawId =
                                claims['Id'] ??
                                claims['nameid'] ??
                                claims['sub'] ??
                                claims['uid'] ??
                                claims['userId'] ??
                                claims['UserId'] ??
                                claims['user_id'] ??
                                claims['id'] ??
                                claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
                            if (rawId != null && String(rawId) !== '0') {
                                userId = String(rawId);
                            }
                        }
                        // Fall back to response body if JWT didn't have it
                        if (userId === '0') {
                            if (tokenData.userId != null && tokenData.userId !== 0) {
                                userId = String(tokenData.userId);
                            } else if (tokenData.id != null && tokenData.id !== 0) {
                                userId = String(tokenData.id);
                            }
                        }

                        // Build user from response
                        const role = tokenData.role ? apiRoleToFrontend(tokenData.role as ApiRole) : UserRole.ADMIN;
                        const user: User = {
                            id: userId,
                            name: tokenData.name ?? tokenData.userName ?? 'مستخدم',
                            email: tokenData.email ?? '',
                            phone: phoneOrEmail,
                            role: role,
                            department: tokenData.departmentId ? String(tokenData.departmentId) : undefined,
                        };

                        console.log('[AuthService] Logged in user ID:', userId, 'Claims:', typeof token === 'string' ? this.decodeJwt(token) : null);

                        localStorage.setItem('jwt_user', JSON.stringify(user));
                        localStorage.removeItem('currentUserId');
                        this.currentUser.set(user);
                        return true;
                    }
                    return false;
                }),
                catchError(err => {
                    console.error('Login failed:', err);
                    return of(false);
                })
            );
    }

    // ─── Mock Login (by user ID) ───
    login(userId: string): boolean {
        const user = this.data.getUserById(userId);
        if (user) {
            this.currentUser.set(user);
            localStorage.setItem('currentUserId', userId);
            return true;
        }
        return false;
    }

    // ─── Mock Login (by role) ───
    loginAs(role: UserRole): boolean {
        const users = this.data.getUsersByRole(role);
        if (users.length > 0) {
            return this.login(users[0].id);
        }
        return false;
    }

    logout(): void {
        this.currentUser.set(null);
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_user');
    }

    hasRole(role: UserRole): boolean {
        return this.userRole() === role;
    }

    hasAnyRole(...roles: UserRole[]): boolean {
        const current = this.userRole();
        return current !== null && roles.includes(current);
    }

    get jwtToken(): string | null {
        return typeof localStorage !== 'undefined' ? localStorage.getItem('jwt_token') : null;
    }

    get isApiAuthenticated(): boolean {
        return !!this.jwtToken;
    }
}
