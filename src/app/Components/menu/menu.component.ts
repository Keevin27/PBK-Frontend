import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {

  fechaHoy: string = '';
  horaHoy: string = '';
  private intervaloReloj: any;

  ngOnInit(): void {
    this.actualizarReloj();
    // Actualiza el reloj del sistema cada segundo de forma eficiente
    this.intervaloReloj = setInterval(() => this.actualizarReloj(), 1000);
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
