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
                    this.currentUser.set(JSON.parse(savedUser));
                } catch { }
            }
        } else if (saved) {
            const user = this.data.getUserById(saved);
            if (user) this.currentUser.set(user);
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

                        // Build user from response
                        const role = tokenData.role ? apiRoleToFrontend(tokenData.role as ApiRole) : UserRole.ADMIN;
                        const user: User = {
                            id: String(tokenData.userId ?? tokenData.id ?? 'api-user'),
                            name: tokenData.name ?? tokenData.userName ?? 'مستخدم',
                            email: tokenData.email ?? '',
                            phone: phoneOrEmail,
                            role: role,
                            department: tokenData.departmentId ? String(tokenData.departmentId) : undefined,
                        };

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
