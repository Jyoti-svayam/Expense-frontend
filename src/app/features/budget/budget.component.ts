import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BudgetService } from 'src/app/core/services/budget.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {

  form!: FormGroup;
  submitted = false;
  loading = false;
  currentMonth = '';

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private toastr: ToastrService,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.setCurrentMonth();

    this.form = this.fb.group({
      month: [{ value: this.currentMonth, disabled: true }],
      amount_limit: ['', [Validators.required, Validators.min(1)]]
    });

    this.loadBudget();
  }

  setCurrentMonth() {
    const now = new Date();
    this.currentMonth = now.toISOString().slice(0, 7);
  }

  loadBudget() {
    this.budgetService.getCurrentBudget().subscribe({
      next: (res: any) => {
        if (res?.amount_limit) {
          this.form.patchValue({
            amount_limit: res.amount_limit
          });
        }
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) return;

    this.loading = true;

  const rawValue = this.form.getRawValue(); // IMPORTANT

  const payload = {
    month: rawValue.month,
    amount_limit: Number(rawValue.amount_limit)
  };

  
    this.budgetService.setBudget(payload).subscribe({
      next: () => {
        this.toastr.success('Budget updated successfully 💰');
        this.loading = false;
        this.router.navigate(['/dashboard'])
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Something went wrong');
        this.loading = false;
      }
    });
  }
}