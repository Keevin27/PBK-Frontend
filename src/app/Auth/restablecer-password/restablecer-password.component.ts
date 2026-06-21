import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

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
  selector: 'app-restablecer-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './restablecer-password.component.html',
  styleUrl: './restablecer-password.component.css'
})
export class RestablecerPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string = '';
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }
  ngOnInit() {
    // Leemos el token de la URL (ej. ?token=xyz)
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.mensajeError = "Enlace inválido o sin token de seguridad.";
      }
    });
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      const nuevaPassword = this.resetForm.get('password')?.value;

      this.authService.restablecerPassword(this.token, nuevaPassword).subscribe({
        next: (res) => {
          this.mensajeExito = "¡Contraseña actualizada correctamente!";
          this.mensajeError = null;
          this.resetForm.reset();
          // Opcional: Redirigir al login después de 3 segundos
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          this.mensajeError = err.error || "El enlace ha expirado o es inválido.";
          this.mensajeExito = null;
        }
      });
    }
  }
}
