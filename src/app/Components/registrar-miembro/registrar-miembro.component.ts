import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MiembroService } from '../../Services/miembro.service';
import { Router, RouterModule } from '@angular/router';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  
  if (password && confirmPassword && password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-registrar-miembro',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule, RouterModule],
  templateUrl: './registrar-miembro.component.html',
  styleUrl: './registrar-miembro.component.css'
})
export class RegistrarMiembroComponent {
  miembroForm: FormGroup;

  mostrarPass: boolean = false;
  mostrarConfirmPass: boolean = false;

  constructor(private fb: FormBuilder, private miembroService: MiembroService, private router: Router) {
    this.miembroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      telefono: ['', Validators.required],
      f_registro: [new Date().toISOString().split('T')[0]],
      estado: [true],
      es_profesor: [false]
    },{ validators: passwordMatchValidator });
  }

  // Funciones para alternar entre ver/ocultar contraseña
  togglePass() {
    this.mostrarPass = !this.mostrarPass;
  }

  toggleConfirmPass() {
    this.mostrarConfirmPass = !this.mostrarConfirmPass;
  }

  OnSubmit() {
    if (this.miembroForm.valid) {
      this.miembroService.guardarMiembro(this.miembroForm.value).subscribe({ next: 
        (dato) =>{
          console.log('Cuenta creada: ', dato);
          this.miembroForm.reset();
          // Lo mandamos al login para que inicie sesión con su nueva cuenta
          this.router.navigate(['/login']);
        },
        error: (err) => console.error(err)
      });
    }
  }

  
  

}
