import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MiembroService } from '../../Services/miembro.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar-miembro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registrar-miembro.component.html',
  styleUrl: './registrar-miembro.component.css'
})
export class RegistrarMiembroComponent {
  miembroForm: FormGroup;


  constructor(private fb: FormBuilder, private miembroService: MiembroService, private router: Router) {
    this.miembroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      f_registro: [new Date().toISOString().split('T')[0]],
      estado: [true],
      es_profesor: [false]
    });
  }

  OnSubmit() {
    if (this.miembroForm.valid) {
      this.miembroService.guardarMiembro(this.miembroForm.value).subscribe({ next: 
        (dato) =>{
          console.log('Miembro Guardado: ', dato);
          this.miembroForm.reset();
        },
        error: (err) => console.error(err)
      });
    }
  }

  
  

}
