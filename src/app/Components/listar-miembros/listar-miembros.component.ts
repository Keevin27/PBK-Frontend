import { Component, OnInit } from '@angular/core';
import { MiembroService } from '../../miembro.service';
import { Miembro } from '../../Models/miembro';

@Component({
  selector: 'app-listar-miembros',
  standalone: true,
  imports: [],
  templateUrl: './listar-miembros.component.html',
  styleUrl: './listar-miembros.component.css'
})
export class ListarMiembrosComponent implements OnInit {
  constructor(private miembroService: MiembroService) { }

  miembros:Miembro[];

  ngOnInit(): void {
    this.obtenerMiembros();
  }

  private obtenerMiembros(){
    this.miembroService.obtenerMiembros().subscribe(dato => {
      this.miembros=dato;
    });
  }
}
