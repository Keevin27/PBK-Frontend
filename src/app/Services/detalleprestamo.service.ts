import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DetallePrestamo } from '../Models/detalle-prestamo';

@Injectable({
  providedIn: 'root'
})
export class DetalleprestamoService {

  private apiUrl = 'http://localhost:8080/detalles-prestamos';

  constructor(private http: HttpClient) { }

  registrarPrestamo(prestamo: DetallePrestamo): Observable<DetallePrestamo> {
      return this.http.post<DetallePrestamo>(`${this.apiUrl}/registrar`, prestamo);
    }
}
