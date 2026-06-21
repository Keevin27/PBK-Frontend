import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8080/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(correo: string, password: string) {
    return this.http.post<AuthResponse>(`${this.api}/login`, { correo, password });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Enviar correo de recuperación
  solicitarRecuperacion(correo: string) {
    return this.http.post(`${this.api}/forgot-password`, { correo }, { responseType: 'text' });
  }

  // Enviar la nueva contraseña junto con el token
  restablecerPassword(token: string, nuevaPassword: string) {
    return this.http.post(`${this.api}/reset-password`, { token, nuevaPassword }, { responseType: 'text' });
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.roles && typeof decoded.roles === 'string') {
        return [decoded.roles.toLowerCase()]; 
      }
      return [];
    }catch (error) {
      console.error('Error al decodificar el token', error);
      return [];
    }
  }
  hasRole(expectedRole: string): boolean {
    const userRoles = this.getUserRoles();
    return userRoles.includes(expectedRole.toLowerCase());
  }
}
