import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { Recurso } from '../../Models/recurso';
import { RecursoService } from '../../Services/recurso.service';

@Component({
  selector: 'app-lista-recursos',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './lista-recursos.component.html',
  styleUrl: './lista-recursos.component.css'
})
export class ListaRecursosComponent {
  listaRecursos: Recurso[] = [];

  carritoPrestamo: Recurso[] = [];

  constructor(private recursoService: RecursoService, private router: Router) { }

  ngOnInit(): void {
    this.obtenerRecursos();
  }

  private obtenerRecursos() {
    this.recursoService.obtenerRecursos().subscribe(dato => {
      this.listaRecursos = dato;
    })
  }

  agregarAlCarrito(recurso: Recurso): void {
    this.carritoPrestamo.push(recurso);
    
    // Alerta interactiva simple de Bootstrap (puedes mejorarla con un Toast)
    alert(`Se agregó "${recurso.titulo}" al carrito de préstamos. Total artículos: ${this.carritoPrestamo.length}`);
  }

}
