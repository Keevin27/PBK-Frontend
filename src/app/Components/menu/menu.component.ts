import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  //ver si esta logueado
  isLoggedIn: boolean = false;

  nombreUsuario: string = 'Usuario';
  rolUsuario: string = 'Rol';
  iniciales: string = 'US';

  fechaHoy: string = '';
  horaHoy: string = '';
  private intervaloReloj: any;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.actualizarReloj();
    // Actualiza el reloj del sistema cada segundo de forma eficiente
    this.intervaloReloj = setInterval(() => this.actualizarReloj(), 1000);
  }

  cargarDatosUsuario() {
    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Leemos los datos que acabamos de meter en el backend
        this.nombreUsuario = decoded.nombre || 'Usuario Desconocido';
        this.rolUsuario = decoded.roles || 'Miembro';
        
        // Calculamos las iniciales
        this.iniciales = this.obtenerIniciales(this.nombreUsuario);
        this.isLoggedIn = true;
      } catch (e) {
        console.error("Error al leer el token");
      }
    }else{
      this.isLoggedIn = false;
    }
  }

  obtenerIniciales(nombre: string): string {
    const partes = nombre.trim().split(' ');
    if (partes.length === 0) return 'US';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase(); // "Ana" -> "AN"
    return (partes[0][0] + partes[1][0]).toUpperCase(); // "Ana Martinez" -> "AM"
  }

  cerrarSesion() {
    this.authService.logout();
    this.isLoggedIn = false;
  }

  ngOnDestroy(): void {
    if (this.intervaloReloj) {
      clearInterval(this.intervaloReloj);
    }
  }

  actualizarReloj(): void {
    const ahora = new Date();
    let fecha = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    this.fechaHoy = fecha.charAt(0).toUpperCase() + fecha.slice(1);
    this.horaHoy = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' hrs';
  }
}
