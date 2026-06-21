import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  cargando: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.cargando = true;
      this.mensajeExito = null;
      this.mensajeError = null;

      const correo = this.forgotForm.get('correo')?.value;

      this.authService.solicitarRecuperacion(correo).subscribe({
        next: (respuesta) => {
          this.mensajeExito = respuesta; // "Si el correo existe..."
          this.cargando = false;
          this.forgotForm.reset();
        },
        error: (err) => {
          this.mensajeError = "Ocurrió un error al intentar enviar el correo.";
          this.cargando = false;
        }
      });
    }
  }

}
