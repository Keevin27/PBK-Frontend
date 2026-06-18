import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiembroService } from '../../Services/miembro.service';
import { Miembro } from '../../Models/miembro';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listar-miembros',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-miembros.component.html',
  styleUrl: './listar-miembros.component.css'
})
export class ListarMiembrosComponent implements OnInit {
  constructor(private miembroService: MiembroService, private router:Router) { }

  miembros:Miembro[];

  ngOnInit(): void {
    this.obtenerMiembros();
  }

  private obtenerMiembros(){
    this.miembroService.obtenerMiembros().subscribe({
      next: (dato) =>{
        this.miembros=dato;
      },
      error: (err) => console.error("Error al obtener miembros:",err)
    });
  }

  irARegistrarMiembro(){
    this.router.navigate(['/miembros/registrar']);
  }
}
