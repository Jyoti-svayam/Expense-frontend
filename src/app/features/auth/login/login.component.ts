import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form!: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f(): any {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    console.log("Login Submitted ✅");

    if (this.form.invalid) {
      this.toastr.error('Please enter valid credentials');
      return;
    }

    this.loading = true;

    this.auth.login(this.form.value).subscribe({
      next: (res: any) => {
        this.toastr.success('Login successful 🎉');

        // ✅ Save token
        localStorage.setItem('token', res.token);

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Login failed');
        this.loading = false;
      }
    });
  }
}