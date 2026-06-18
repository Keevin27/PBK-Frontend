import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Recurso } from '../../Models/recurso';
import { RecursoService } from '../../Services/recurso.service';
import { DetallePrestamo } from '../../Models/detalle-prestamo';
import { Prestamo } from '../../Models/prestamo';
import { PrestamoService } from '../../Services/prestamo.service';
import { forkJoin, switchMap } from 'rxjs';
import { DetalleprestamoService } from '../../Services/detalleprestamo.service';

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

  prestamo: Prestamo = {} as Prestamo; 
  tarifaMoraPorDia: number = 1.50; 
  carnetMiembro: string = ''; 
  terminoBusqueda: string = '';

  constructor(private recursoService: RecursoService, private prestamoService: PrestamoService, private detallePrestamoService: DetalleprestamoService) { }

  ngOnInit(): void {
    this.obtenerRecursos();
  }

  private obtenerRecursos() {
    this.recursoService.obtenerRecursos().subscribe(dato => {
      this.listaRecursos = dato;
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

    // Insertamos la propiedad codigoEjemplar independiente sin sobreescribir propiedades existentes
    this.carritoPrestamo.push({
      ejemplar: {
        recurso: recurso
      },
      codigoEjemplarAsignado: '' 
    });
    this.mostrarNotificacion(`Agregado: "${recurso.titulo}" (${this.carritoPrestamo.length}/5)`, 'success');
  }

//######################################################################################
  mostrarNotificacion(texto: string, tipo: 'success' | 'error'): void {
    const nuevoToast: MensajeToast = {
      id: this.contadorIdToast++,
      texto: texto,
      tipo: tipo
    };
    this.mensajesToast.push(nuevoToast);
    setTimeout(() => { this.removerToast(nuevoToast); }, 2500);
  }

  removerToast(toast: MensajeToast): void {
    this.mensajesToast = this.mensajesToast.filter(t => t.id !== toast.id);
  }
//######################################################################################

  prepararPrestamo(): void {
    const hoy = new Date();
    const entrega = new Date();
    entrega.setDate(hoy.getDate() + 7);

    // Formateo de fechas para asignación correcta al objeto
    this.prestamo.f_inicio = hoy;
    this.prestamo.f_dev_esperada = entrega;
  }

  // Helper para mostrar la fecha formateada en la interfaz de usuario
  get fechaInicioFormateada(): string {
    return this.prestamo.f_inicio ? new Date(this.prestamo.f_inicio).toLocaleDateString() : '';
  }

  get fechaEntregaFormateada(): string {
    return this.prestamo.f_dev_esperada ? new Date(this.prestamo.f_dev_esperada).toLocaleDateString() : '';
  }

  quitarDelCarrito(recurso: Recurso): void {
    this.carritoPrestamo = this.carritoPrestamo.filter(item => item.ejemplar.recurso.id_recurso !== recurso.id_recurso);
    this.mostrarNotificacion(`Removido: "${recurso.titulo}"`, 'error');
  }

  // Validación requerida para cerciorarse de que todos los ejemplares tengan códigos ingresados
  tieneCodigosVacios(): boolean {
    return this.carritoPrestamo.some(item => !item.codigoEjemplarAsignado || !item.codigoEjemplarAsignado.trim());
  }

  confirmarPrestamo(): void {
  if (this.carritoPrestamo.length === 0 || this.tieneCodigosVacios()) return;

  //Creamos el objeto del préstamo
  const nuevoPrestamo: Prestamo = {
    f_inicio: this.prestamo.f_inicio,
    f_dev_esperada: this.prestamo.f_dev_esperada
  };

  //Ejecutamos el flujo secuencial encadenado
  this.prestamoService.registrarPrestamo(nuevoPrestamo).pipe(
    switchMap((prestamoGuardado: Prestamo) => {
      
      console.log('Préstamo guardado con ID:', prestamoGuardado.id_prestamo);

      // Mapeamos nuestro carrito para construir instancias reales de DetallePrestamo
      const peticionesDetalles = this.carritoPrestamo.map(item => {
        const detalle: DetallePrestamo = {
          prestamo: prestamoGuardado, 
          ejemplar: {
            id_ejemplar: item.codigoEjemplarAsignado.toUpperCase().trim(), // El código ingresado
            recurso: item.ejemplar.recurso
          }
        };
        // Retornamos el observable de la petición sin ejecutarlo aún
        return this.detallePrestamoService.registrarPrestamo(detalle);
      });

      // forkJoin ejecuta todas las peticiones de detalles en paralelo y espera a que terminen todas
      return forkJoin(peticionesDetalles);
    })
  ).subscribe({
    next: (detallesGuardados) => {
      
      this.mostrarNotificacion(`¡Préstamo y sus ${detallesGuardados.length} detalles registrados con éxito!`, 'success');
      
      // Limpiamos los controles para el próximo uso
      this.carritoPrestamo = [];
      this.carnetMiembro = '';
      this.prestamo = {} as Prestamo;
    },
    error: (error) => {
      console.error('Error en el flujo de guardado:', error);
      this.mostrarNotificacion('Error al procesar la operación. Revisa la consola.', 'error');
    }
  });
}

  get recursosFiltrados(): Recurso[] {
    if (!this.terminoBusqueda.trim()) {
      return this.listaRecursos;
    }
    const busqueda = this.terminoBusqueda.toLowerCase().trim();
    return this.listaRecursos.filter(recurso => {
      const titulo = recurso.titulo ? recurso.titulo.toLowerCase() : '';
      const descripcion = recurso.descripcion ? recurso.descripcion.toLowerCase() : '';
      const autor = recurso.autor && recurso.autor.nombre ? recurso.autor.nombre.toLowerCase() : '';

      return titulo.includes(busqueda) || 
             descripcion.includes(busqueda) || 
             autor.includes(busqueda);
    });
  }
}