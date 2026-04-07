import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

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
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.matchPassword });
  }

  // ✅ Password Match Validator
  matchPassword(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { mismatch: true };
  }

  // ✅ Strict-safe getter
  get f(): any {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;


    // ❌ Stop if invalid
    if (this.form.invalid) {
      this.toastr.error('Please fill all fields correctly');
      return;
    }

    this.loading = true;

    const { name, email, password } = this.form.value;

    this.auth.signup({ name, email, password }).subscribe({
      next: () => {
        this.toastr.success('Signup successful 🎉');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Signup failed');
        this.loading = false;
      }
    });
  }
}