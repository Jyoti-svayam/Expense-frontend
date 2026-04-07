import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { BudgetService } from 'src/app/core/services/budget.service';

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
    private router: Router,
    private budgetService : BudgetService
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

  if (this.form.invalid) {
    this.toastr.error('Please enter valid credentials');
    return;
  }

  this.loading = true;

  this.auth.login(this.form.value).subscribe({
    next: (loginRes: any) => {

      // TOKEN SAVE (correct place)
      if (loginRes?.accessToken) {
        localStorage.setItem('token', loginRes.accessToken);
      }

      // 🔥 NOW CHECK BUDGET
      this.budgetService.getCurrentBudget().subscribe({
        next: (budgetRes: any) => {

          if (budgetRes && budgetRes.amount_limit) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/budget']);
          }

          this.toastr.success('Login successful 🎉');
          this.loading = false;
        },

        error: () => {
          // fallback → new user
          this.router.navigate(['/budget']);
          this.loading = false;
        }
      });

    },

    error: (err) => {
      this.toastr.error(err.error?.message || 'Login failed');
      this.loading = false;
    }
  });
}
}