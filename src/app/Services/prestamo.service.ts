import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Prestamo } from '../Models/prestamo';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {

  private apiUrl = 'http://localhost:8080/prestamos';

  constructor(private http: HttpClient) { }

  registrarPrestamo(prestamo: Prestamo): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${this.apiUrl}/registrar`, prestamo);
  }
}
