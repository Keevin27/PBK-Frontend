import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MiembroService } from '../../Services/miembro.service';
import { Miembro } from '../../Models/miembro';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-miembros',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './listar-miembros.component.html',
  styleUrl: './listar-miembros.component.css'
})
export class ListarMiembrosComponent implements OnInit {
  constructor(private miembroService: MiembroService, private router:Router) { }

  //para guardar miembros
  miembros:any[];
  //lista de miembros intacta
  miembrosOriginales: any[] = [];
  //para guardar los roles
  roles: any[] = [];

  terminoBusqueda: string = '';
  criterioBusqueda: string = 'todos';

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

        Swal.fire({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
          icon: 'success', title: 'Estado actualizado'
        });

        this.obtenerMiembros();
      },
      error: (err) => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    });
  }

  renovarCarnet(id: number | undefined) {
    if (!id) return; // Validación de seguridad

    Swal.fire({
      title: '¿Renovar Carnet?',
      text: "Se extenderá la vigencia por 1 año.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ffc107', // Color warning
      cancelButtonColor: '#1a1d24',  // Color de tu tarjeta
      confirmButtonText: 'Sí, renovar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if(confirm('¿Estás seguro de renovar el carnet por 1 año más?')) {
        this.miembroService.renovarCarnet(id).subscribe({
          next: (res) => Swal.fire('¡Éxito!', res.mensaje, 'success'),
          error: (err) => Swal.fire('Error', 'No se pudo renovar', 'error')
        });
      }
    });
  }

  cambiarRol(id: number | undefined, nombreRol: string) {
    if (!id) return;

    Swal.fire({
      title: `¿Asignar rol de ${nombreRol}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#1a1d24',
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.miembroService.cambiarRol(id, nombreRol).subscribe({
          next: (res) => {Swal.fire('¡Actualizado!', res.mensaje, 'success')
            this.obtenerMiembros();
          },
          error: (err) => Swal.fire('Error', 'No se pudo cambiar el rol', 'error')
        });
      }
    });
  }
  
}
