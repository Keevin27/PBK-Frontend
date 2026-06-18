import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Miembro } from './Models/miembro';

@Injectable({
  providedIn: 'root'
})
export class MiembroService {

  //todos los miembros
  private BaseURL = "http://localhost:8080/miembros/miembros";

  constructor(private http: HttpClient) { }

  //para obtener todos los miembros
  obtenerMiembros():Observable<Miembro[]> {
    return this.http.get<Miembro[]>(`${this.BaseURL}`);
  }
}
