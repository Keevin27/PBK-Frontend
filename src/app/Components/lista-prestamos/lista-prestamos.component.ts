import { Component, OnInit } from '@angular/core';
import { PrestamoService } from '../../Services/prestamo.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Prestamo } from '../../Models/prestamo';
import { DetalleprestamoService } from '../../Services/detalleprestamo.service';
import { TarifaService } from '../../Services/tarifa.service';
import { TransaccionService } from '../../Services/transaccion.service';
import { MoraService } from '../../Services/mora.service';
import { Tarifa } from '../../Models/tarifa';
import { switchMap, of } from 'rxjs';

interface MensajeToast {
  id: number;
  texto: string;
  tipo: 'success' | 'error';
}

@Component({
  selector: 'app-lista-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-prestamos.component.html',
  styleUrl: './lista-prestamos.component.css'
})
export class ListaPrestamosComponent implements OnInit {
  listaPrestamos: Prestamo[] = [];
  terminoBusqueda: string = '';
  tarifaActual!: Tarifa;

  mensajesToast: MensajeToast[] = [];
  private contadorIdToast = 0;

  constructor(
    private prestamoService: PrestamoService,
    private detallePrestamoService: DetalleprestamoService,
    private tarifaService: TarifaService,
    private transaccionService: TransaccionService,
    private moraService: MoraService
  ) { }

  ngOnInit(): void {
    this.obtenerPrestamos();
    this.obtenerTarifaGlobal();
  }

  obtenerTarifaGlobal(): void {
    this.tarifaService.obtenerUltimaTarifa().subscribe({
      next: (t) => this.tarifaActual = t,
      error: (err) => console.error('Error cargando la tarifa diaria:', err)
    });
  }

  obtenerPrestamos(): void {
    this.prestamoService.obtenerPrestamos().subscribe({
      next: (datos) => this.listaPrestamos = datos,
      error: (err) => console.error('Error cargando historial:', err)
    });
  }

  // Calcula el monto acumulado o final de la mora
  calcularMontoMora(prestamo: Prestamo): number {
    if (!this.tarifaActual || !this.tarifaActual.monto_diario) return 0;

    const fechaLimite = new Date(prestamo.f_dev_esperada);
    const fechaFin = prestamo.f_dev_real ? new Date(prestamo.f_dev_real) : new Date();

    // Normalizar fechas a medianoche para evitar desfases de horas
    fechaLimite.setHours(0, 0, 0, 0);
    fechaFin.setHours(0, 0, 0, 0);

    if (fechaFin <= fechaLimite) return 0;

    const diferenciaTiempo = fechaFin.getTime() - fechaLimite.getTime();
    const diasRetraso = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));

    return diasRetraso * this.tarifaActual.monto_diario;
  }

  marcarComoEntregado(prestamo: Prestamo): void {
  const hoy = new Date();
  const prestamoActualizado = { ...prestamo, f_dev_real: hoy };
  const montoMoraTotal = this.calcularMontoMora(prestamoActualizado);

  // 1. Primero actualizamos el préstamo con su fecha de devolución real
  this.prestamoService.actualizarPrestamo(prestamo.id_prestamo!, prestamoActualizado).pipe(
    switchMap(() => {
      if (montoMoraTotal > 0) {
        
        // 2. ENVIAR SOLO UN REGISTRO: La Mora contiene implícitamente los campos de Transacción
        const objetoMora: any = {
          // Propiedades heredadas de Transaccion (Los IDs van nulos para que la BD los genere)
          id_transaccion: null!,
          fecha: hoy,
          monto: montoMoraTotal,

          // Propiedades específicas de Mora
          id_mora: null!,
          monto_aplicado: this.tarifaActual.monto_diario,

          // Objetos relacionales referenciados estructuralmente por ID
          tarifa: {
            id_tarifa: this.tarifaActual.id_tarifa
          },
          prestamo: {
            id_prestamo: prestamo.id_prestamo
          }
        };

        return this.moraService.registrarMora(objetoMora);
      } else {
        // Si no hay mora, terminamos con éxito sin penalizaciones
        return of(null);
      }
    })
  ).subscribe({
    next: (resultado) => {
      if (resultado) {
        this.mostrarNotificacion(`Devolución procesada con retraso. Multa generada de $${montoMoraTotal.toFixed(2)}`, 'error');
      } else {
        this.mostrarNotificacion(`Préstamo #${prestamo.id_prestamo} devuelto a tiempo sin penalizaciones.`, 'success');
      }
      this.obtenerPrestamos();
    },
    error: (err) => {
      console.error('Error en el flujo:', err);
      this.mostrarNotificacion('Error al procesar el flujo de la entrega.', 'error');
    }
  });
}

  esPrestamoVencido(fechaMaxima: Date): boolean {
    if (!fechaMaxima) return false;
    const max = new Date(fechaMaxima);
    max.setHours(0, 0, 0, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return max < hoy;
  }

  get prestamosFiltrados(): any[] {
  // Si el cuadro de búsqueda está vacío, devolvemos toda la lista
  if (!this.terminoBusqueda.trim()) return this.listaPrestamos;
  
  const busqueda = this.terminoBusqueda.toLowerCase().trim();
  
  return this.listaPrestamos.filter((p: any) => {
    // 1. Extraemos las variables de forma segura con el operador opcional ?.
    const carnetCodigo = p.carnet?.no_carnet ? String(p.carnet.no_carnet).toLowerCase() : ''; // O el nombre exacto de la propiedad de tu ID carnet en el modelo
    const nombreMiembro = p.carnet?.miembro?.nombre?.toLowerCase() || '';
    const apellidoMiembro = p.carnet?.miembro?.apellido?.toLowerCase() || '';
    
    // 2. Evaluamos si el término buscado coincide con el carnet, el nombre o el apellido
    return carnetCodigo.includes(busqueda) || 
           nombreMiembro.includes(busqueda) || 
           apellidoMiembro.includes(busqueda);
  });
}

  mostrarNotificacion(texto: string, tipo: 'success' | 'error'): void {
    const nuevoToast: MensajeToast = { id: this.contadorIdToast++, texto, tipo };
    this.mensajesToast.push(nuevoToast);
    setTimeout(() => { this.removerToast(nuevoToast); }, 2800);
  }

  removerToast(toast: MensajeToast): void {
    this.mensajesToast = this.mensajesToast.filter(t => t.id !== toast.id);
  }

  prestamoSeleccionado: any = null;
  detallesPrestamoSeleccionado: any[] = [];
  cargandoDetalles: boolean = false;
  verDetallesDelPrestamo(prestamo: any): void {
    this.prestamoSeleccionado = prestamo;
    this.detallesPrestamoSeleccionado = [];
    this.cargandoDetalles = true;

    this.detallePrestamoService.obtenerDetallesPorPrestamo(prestamo.id_prestamo).subscribe({
      next: (detalles) => {
        this.detallesPrestamoSeleccionado = detalles;
        this.cargandoDetalles = false;
      },
      error: (err) => {
        console.error(err);
        this.cargandoDetalles = false;
      }
    });
  }
  // Variables globales nuevas para el control del segundo modal
prestamoMoraSeleccionado: any = null;
datosMoraCalculados: any = null;

// Helper para saber si un préstamo que YA se entregó, se entregó tarde
esPrestamoVencidoAlEntregar(prestamo: Prestamo): boolean {
  if (!prestamo.f_dev_real || !prestamo.f_dev_esperada) return false;
  const max = new Date(prestamo.f_dev_esperada);
  const real = new Date(prestamo.f_dev_real);
  max.setHours(0, 0, 0, 0);
  real.setHours(0, 0, 0, 0);
  return real > max;
}

// Almacena y calcula los datos específicos para mostrarlos en el recibo modal
verDesgloseMora(prestamo: Prestamo): void {
  this.prestamoMoraSeleccionado = prestamo;
  
  const fechaLimite = new Date(prestamo.f_dev_esperada);
  const fechaFin = new Date(prestamo.f_dev_real!);
  
  fechaLimite.setHours(0, 0, 0, 0);
  fechaFin.setHours(0, 0, 0, 0);

  const diferenciaTiempo = fechaFin.getTime() - fechaLimite.getTime();
  const diasRetraso = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
  
  // Si tu backend ya almacena una relación o si usamos la tarifa en memoria actual
  const tarifaDiariaBase = this.tarifaActual?.monto_diario || 1.00; 

  this.datosMoraCalculados = {
    dias: diasRetraso > 0 ? diasRetraso : 0,
    tarifaDiaria: tarifaDiariaBase,
    total: (diasRetraso > 0 ? diasRetraso : 0) * tarifaDiariaBase
  };
}
}