import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Miembro } from '../Models/miembro';

@Injectable({
  providedIn: 'root'
})
export class MiembroService {

  //todos los miembros
  private BaseURL = "http://localhost:8080/miembros";

  constructor(private httpClient: HttpClient) { }

  //para obtener todos los miembros
  obtenerMiembros():Observable<Miembro[]> {
    return this.httpClient.get<Miembro[]>(`${this.BaseURL}`);
  }

  guardarMiembro(miembro: Miembro): Observable<Object> {
    return this.httpClient.post(`${this.BaseURL}`, miembro);
  }
}
