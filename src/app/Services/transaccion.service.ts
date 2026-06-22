import { Injectable } from '@angular/core';
import { Transaccion } from '../Models/transaccion';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {

  private apiUrl = 'https://pbk-backend.onrender.com/transacciones';

  constructor(private httpClient: HttpClient) { }

  registrarTransaccion(transaccion: Transaccion): Observable<Transaccion> {
      return this.httpClient.post<Transaccion>(`${this.apiUrl}/registrar`, transaccion);
    }
}
