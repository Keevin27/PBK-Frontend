import { Injectable } from '@angular/core';
import { Tarifa } from '../Models/tarifa';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TarifaService {

  private apiUrl = 'http://localhost:8080/tarifas';
  constructor(private httpClient: HttpClient) { }

  obtenerUltimaTarifa(): Observable<Tarifa> {
    return this.httpClient.get<Tarifa>(`${this.apiUrl}/ultima`);
  }

}
