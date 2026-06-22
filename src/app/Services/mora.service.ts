import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Mora } from '../Models/mora';

@Injectable({
  providedIn: 'root'
})
export class MoraService {

  private apiUrl = 'https://pbk-backend.onrender.com/moras';

  constructor(private httpClient: HttpClient) { }

  registrarMora(mora: Mora): Observable<Mora> {
      return this.httpClient.post<Mora>(`${this.apiUrl}/registrar`, mora);
  }
  obtenerMoraPorIdPrestamo(id: number): Observable<Mora> {
    return this.httpClient.get<Mora>(`${this.apiUrl}/${id}`);
  }
}
