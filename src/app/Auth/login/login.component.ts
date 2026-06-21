import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router,RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule,RouterModule],
  templateUrl: '../Login/login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  mensajeError = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.loginForm.invalid) return;
    const { correo, password } = this.loginForm.value;
    this.auth.login(correo!, password!).subscribe({
      next: res => {
        this.auth.saveToken(res.token);
        this.router.navigate(['/']);
      },
      error: () => {
        this.mensajeError = 'Correo o contraseña inválidos';
      },
    });
  }
}