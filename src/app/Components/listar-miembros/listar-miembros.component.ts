import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MiembroService } from '../../Services/miembro.service';
import { Miembro } from '../../Models/miembro';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-listar-miembros',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './listar-miembros.component.html',
  styleUrl: './listar-miembros.component.css'
})
export class ListarMiembrosComponent implements OnInit {
  constructor(private miembroService: MiembroService, private router:Router,public authService: AuthService) { }

  //para guardar miembros
  miembros:any[];
  //lista de miembros intacta
  miembrosOriginales: any[] = [];
  //para guardar los roles
  roles: any[] = [];

  terminoBusqueda: string = '';
  criterioBusqueda: string = 'todos';

  toastMensaje: string = '';
  toastClass: string = ''; 
  mostrarToast: boolean = false;

  mostrarModal: boolean = false;
  modalTitulo: string = '';
  modalMensaje: string = '';
  accionConfirmada: () => void = () => {};

  ngOnInit(): void {
    this.obtenerMiembros();
    this.obtenerRoles();
  }

  private obtenerMiembros(){
    this.miembroService.obtenerMiembros().subscribe({
      next: (dato) =>{
        this.miembrosOriginales = dato; 
        this.miembros = dato;           
        this.filtrarMiembros();
      },
      error: (err) => console.error("Error al obtener miembros:",err)
    });
  }

  private obtenerRoles(){
    this.miembroService.obtenerRoles().subscribe({
      next: (dato) => this.roles = dato,
      error: (err) => console.error("Error al cargar roles")
    });
  }

  filtrarMiembros() {
    // Si el input está vacío, devolvemos la lista completa
    if (!this.terminoBusqueda.trim()) {
      this.miembros = [...this.miembrosOriginales];
      return;
    }

    // Convertimos a minúsculas para que la búsqueda no sea sensible a mayúsculas
    const termino = this.terminoBusqueda.toLowerCase().trim();

    this.miembros = this.miembrosOriginales.filter(item => {
      const m = item.miembro;
      
      // Búsqueda global (todos los campos)
      if (this.criterioBusqueda === 'todos') {
        return m.id_miembro.toString().includes(termino) ||
               m.nombre.toLowerCase().includes(termino) ||
               m.apellido.toLowerCase().includes(termino) ||
               m.correo.toLowerCase().includes(termino) ||
               (m.telefono && m.telefono.includes(termino));
      } 
      // Búsqueda por un criterio específico
      else {
        const valorCampo = m[this.criterioBusqueda];
        if (valorCampo) {
          return valorCampo.toString().toLowerCase().includes(termino);
        }
        return false;
      }
    });
  }

  cambiarEstado(miembro: Miembro) {
    // Si por alguna razón el miembro no tiene ID, detenemos la función aquí
    if (!miembro.id_miembro) return; 
    
    this.miembroService.cambiarEstado(miembro.id_miembro).subscribe({
      
      next: (miembroActualizado) => {
        // Actualizamos visualmente el estado
        miembro.estado = miembroActualizado.estado;

        this.lanzarToast('Estado de miembro actualizado con éxito.', 'success');

        this.obtenerMiembros();
      },
      error: (err) => this.lanzarToast('No se pudo cambiar el estado del miembro.', 'danger')
    });
  }

  renovarCarnet(id: number | undefined) {
    if (!id) return; // Validación de seguridad

    this.abrirModalConfirmacion(
      '¿Renovar Carnet?',
      '¿Estás seguro de que deseas renovar el carnet por 1 año más? Esta acción extenderá la vigencia de la membresía de forma inmediata.',
      () => {
        this.miembroService.renovarCarnet(id).subscribe({
          next: (res: any) => {
            this.lanzarToast(res.mensaje, 'success');
            this.obtenerMiembros();
          },
          error: (err) => this.lanzarToast('No se pudo renovar el carnet.', 'danger')
        });
      }
    );
  }

  cambiarRol(id: number | undefined, nombreRol: string) {
    if (!id) return;

    this.abrirModalConfirmacion(
      'Asignación de Rol',
      `¿Estás seguro de que deseas cambiar el rol de este usuario a "${nombreRol.toUpperCase()}"? Se modificarán sus privilegios en el sistema.`,
      () => {
        this.miembroService.cambiarRol(id, nombreRol).subscribe({
          next: (res: any) => {
            this.lanzarToast(res.mensaje, 'success');
            this.obtenerMiembros();
          },
          error: (err) => this.lanzarToast('No se pudo cambiar el rol.', 'danger')
        });
      }
    );
  
  
  }

  lanzarToast(mensaje: string, tipo: 'success' | 'danger' | 'warning' = 'success') {
    this.toastMensaje = mensaje;
    if (tipo === 'success') this.toastClass = 'bg-success text-white';
    if (tipo === 'danger') this.toastClass = 'bg-danger text-white';
    if (tipo === 'warning') this.toastClass = 'bg-warning text-dark';
    
    this.mostrarToast = true;

    // Se oculta automáticamente después de 3.5 segundos
    setTimeout(() => {
      this.mostrarToast = false;
    }, 3500);
  }

  abrirModalConfirmacion(titulo: string, mensaje: string, accion: () => void) {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.accionConfirmada = accion;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  confirmarModal() {
    this.accionConfirmada(); // Ejecuta la acción guardada (renovar o cambiar rol)
    this.cerrarModal();
  }
  
}
