import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Recurso } from '../Models/recurso';

@Injectable({
  providedIn: 'root'
})
export class RecursoService {

  private apiUrl = 'http://localhost:8080/recursos';
  
  constructor(private http: HttpClient) { }

  obtenerRecursos(): Observable<Recurso[]> {
    return this.http.get<Recurso[]>(`${this.apiUrl}/recursos`);
  }
}
