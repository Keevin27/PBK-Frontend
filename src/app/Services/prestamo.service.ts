import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Prestamo } from '../Models/prestamo';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {

  private apiUrl = 'https://pbk-backend.onrender.com/prestamos';

  constructor(private http: HttpClient) { }

  registrarPrestamo(prestamo: Prestamo): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${this.apiUrl}/registrar`, prestamo);
  }
  //Listra todos los prestamos registrados 
  obtenerPrestamos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}/prestamos`);
  }
  // Actualiza el préstamo (agrega la fecha real de entrega en la BD)
  actualizarPrestamo(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/actualizar/${id}`, {});
  }
  verificarSiExisteCarnet(carnet: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/validar-carnet/${carnet}`);
  }
  registrarPrestamoCompleto(dto: any): Observable <any> {
    return this.http.post<any>(`${this.apiUrl}/registrar-completo`, dto);
  
  }
}
