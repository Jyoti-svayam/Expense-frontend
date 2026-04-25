import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { BudgetService } from 'src/app/core/services/budget.service';

@Component({
  selector: 'app-add-expense-modal',
  templateUrl: './add-expense-modal.component.html',
  styleUrls: ['./add-expense-modal.component.css']
})
export class AddExpenseModalComponent implements OnInit {

  form!: FormGroup;
  submitted = false;

  categories: any[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddExpenseModalComponent>,
    private budget : BudgetService,
    private fb: FormBuilder,
      @Inject(MAT_DIALOG_DATA) public data: any   
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      amount: ['', Validators.required],
      date: ['', Validators.required],
      category: ['', Validators.required],
      payment: ['', Validators.required],
      currency: ['INR', Validators.required],
      notes: ['']
    });

    // Load categories first: mat-select needs options before patchValue or category stays invalid
    this.budget.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : [];
        this.patchEditFormIfNeeded();
      },
      error: (err) => {
        console.error(err);
        this.patchEditFormIfNeeded();
      }
    });
  }

  private patchEditFormIfNeeded() {
    if (!this.data?.id) return;
    this.form.patchValue({
      title: this.data.title,
      amount: this.data.amount,
      date: this.apiExpenseDateToHtmlDate(this.data.expense_date),
      category: this.data.category,
      payment: this.paymentFromApi(this.data.payment_method),
      currency: this.data.currency || 'INR',
      notes: this.data.notes ?? ''
    });
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  /** List API returns DD-MM-YYYY; <input type="date"> needs YYYY-MM-DD */
  private apiExpenseDateToHtmlDate(display: string | undefined): string {
    if (!display) return '';
    const s = String(display).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    let m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s);
    if (!m) m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
    if (!m) return '';
    const [, d, mo, y] = m;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  /** DB may store lowercase; mat-select options use Cash / UPI / Card */
  private paymentFromApi(method: string | undefined): string {
    if (!method) return '';
    const key = method.trim().toLowerCase();
    const map: Record<string, string> = { cash: 'Cash', upi: 'UPI', card: 'Card' };
    return map[key] || method;
  }

  get f() {
    return this.form.controls;
  }

  close() {
    this.dialogRef.close();
  }



//   submit() {
//   this.submitted = true;

//   if (this.form.invalid) return;

//   const payload = {
//     ...this.form.value,
//     expense_date: this.form.value.date,
//     payment_method: this.form.value.payment
//   };

//   this.budget.addExpense(payload).subscribe({
//     next: (data) => {
//       console.log("✅ Expense added:", data);
//     },
//     error: (err) => {
//       console.log("❌ failed post api", err);
//     }
//   });

//   this.dialogRef.close(payload);
// }
// }

  submit() {
    this.submitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.value,
      expense_date: this.form.value.date,
      payment_method: this.form.value.payment
    };

    if (this.data && this.data.id) {
      this.budget.updateExpense(this.data.id, payload).subscribe({
        next: (data: any) => {
          console.log("✅ Expense updated:", data);
          this.dialogRef.close(payload);
        },
        error: (err: any) => {
          console.log("❌ failed update api", err);
        }
      });
    } else {
      this.budget.addExpense(payload).subscribe({
        next: (data: any) => {
          console.log("✅ Expense added:", data);
          this.dialogRef.close(payload);
        },
        error: (err: any) => {
          console.log("❌ failed post api", err);
        }
      });
    }
  }
}
