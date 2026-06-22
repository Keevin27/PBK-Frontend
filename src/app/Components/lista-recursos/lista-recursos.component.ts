import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Recurso } from '../../Models/recurso';
import { RecursoService } from '../../Services/recurso.service';
import { PrestamoService } from '../../Services/prestamo.service';
import { TarifaService } from '../../Services/tarifa.service';
import { AuthService } from '../../Auth/auth.service';

interface MensajeToast {
  id: number;
  texto: string;
  tipo: 'success' | 'error';
}

@Component({
  selector: 'app-lista-recursos',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './lista-recursos.component.html',
  styleUrl: './lista-recursos.component.css'
})
export class ListaRecursosComponent implements OnInit {
  listaRecursos: Recurso[] = [];
  carritoPrestamo: any[] = [];
  mensajesToast: MensajeToast[] = [];
  private contadorIdToast = 0;

  tarifaMoraPorDia: number = 1.50;
  carnetMiembro: string = '';
  terminoBusqueda: string = '';
  recursoSeleccionado: Recurso | null = null;

  constructor(
    private recursoService: RecursoService, 
    private prestamoService: PrestamoService, 
    private tarifaService: TarifaService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.obtenerRecursos();
  }

  private obtenerRecursos() {
    this.recursoService.obtenerRecursos().subscribe(dato => {
      this.listaRecursos = dato;
    });
    this.tarifaService.obtenerUltimaTarifa().subscribe(dato => {
      this.tarifaMoraPorDia = dato.monto_diario;
    });
  }

  agregarAlCarrito(recurso: Recurso): void {
    if (this.carritoPrestamo.length >= 5) {
      this.mostrarNotificacion('¡Límite alcanzado! Máximo 5 recursos por préstamo.', 'error');
      return;
    }

    const yaExiste = this.carritoPrestamo.some(item => item.ejemplar.recurso.id_recurso === recurso.id_recurso);
    if (yaExiste) {
      this.mostrarNotificacion(`"${recurso.titulo}" ya está en tu lista.`, 'error');
      return;
    }

    this.carritoPrestamo.push({
      ejemplar: { recurso: recurso },
      codigoEjemplarAsignado: ''
    });
    this.mostrarNotificacion(`Agregado: "${recurso.titulo}" (${this.carritoPrestamo.length}/5)`, 'success');
  }

  mostrarNotificacion(texto: string, tipo: 'success' | 'error'): void {
    const nuevoToast: MensajeToast = {
      id: this.contadorIdToast++,
      texto: texto,
      tipo: tipo
    };
    this.mensajesToast.push(nuevoToast);
    setTimeout(() => { this.removerToast(nuevoToast); }, 3500); 
  }

  removerToast(toast: MensajeToast): void {
    this.mensajesToast = this.mensajesToast.filter(t => t.id !== toast.id);
  }

  quitarDelCarrito(recurso: Recurso): void {
    this.carritoPrestamo = this.carritoPrestamo.filter(item => item.ejemplar.recurso.id_recurso !== recurso.id_recurso);
    this.mostrarNotificacion(`Removido: "${recurso.titulo}"`, 'error');
  }

  tieneCodigosVacios(): boolean {
    return this.carritoPrestamo.some(item => !item.codigoEjemplarAsignado || !item.codigoEjemplarAsignado.trim());
  }

  confirmarPrestamo(): void {
    if (this.carritoPrestamo.length === 0 || this.tieneCodigosVacios()) return;

    if (!this.carnetMiembro || !this.carnetMiembro.trim()) {
      this.mostrarNotificacion('Por favor, ingrese un número de carnet.', 'error');
      return;
    }

    const listaIdsEjemplares = this.carritoPrestamo.map(item => 
      item.codigoEjemplarAsignado.toUpperCase().trim()
    );

    const prestamoCompletoDto: any = {
      noCarnet: this.carnetMiembro.trim(),
      idEjemplares: listaIdsEjemplares
    };

    this.prestamoService.registrarPrestamoCompleto(prestamoCompletoDto).subscribe({
      next: (respuesta: any) => {
        // Muestra el mensaje exitoso con la fecha devuelta por el procedimiento
        this.mostrarNotificacion(respuesta.message, 'success');
        
        // Limpieza completa
        this.carritoPrestamo = [];
        this.carnetMiembro = '';
      },
      error: (err) => {
        console.error('Error al guardar préstamo:', err);
        let mensajeError = 'Ocurrió un problema inesperado al procesar el préstamo.';
        
        if (err.error && err.error.message) {
          mensajeError = err.error.message;
        } else if (typeof err.error === 'string') {
          mensajeError = err.error;
        }
        this.mostrarNotificacion(mensajeError, 'error');
      }
    });
  }

  get recursosFiltrados(): Recurso[] {
    if (!this.terminoBusqueda.trim()) return this.listaRecursos;
    const busqueda = this.terminoBusqueda.toLowerCase().trim();
    return this.listaRecursos.filter(recurso => {
      const titulo = recurso.titulo ? recurso.titulo.toLowerCase() : '';
      const descripcion = recurso.descripcion ? recurso.descripcion.toLowerCase() : '';
      const autor = recurso.autor && recurso.autor.nombre ? recurso.autor.nombre.toLowerCase() : '';
      return titulo.includes(busqueda) || descripcion.includes(busqueda) || autor.includes(busqueda);
    });
  }
  abrirDetalle(recurso: Recurso): void {
  this.recursoSeleccionado = recurso;
  
  setTimeout(() => {
    const modalElement = document.getElementById('modalDetalleRecurso');
    if (modalElement) {
      // Usamos la API de Bootstrap global cargada en el navegador
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      bootstrapModal.show();
    }
  }, 50);
}
soloNumeros(event: KeyboardEvent): boolean {
  return /[0-9]/.test(event.key);
}
}