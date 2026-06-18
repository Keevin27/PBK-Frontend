import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registrar-miembro',
  standalone: true,
  imports: [],
  templateUrl: './registrar-miembro.component.html',
  styleUrl: './registrar-miembro.component.css'
})
export class RegistrarMiembroComponent {
  miembroForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.miembroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      f_registro: [new Date().toISOString().split('T')[0]],
      estado:[true],
      es_profesor: [false]
    });
  }

  OnSubmit() {
    if (this.miembroForm.valid) {
      console.log(this.miembroForm.value);
      // Aquí puedes agregar la lógica para enviar los datos al servidor o realizar otras acciones
    } else {
      console.log('Formulario no válido');
    }
  }
  

}
