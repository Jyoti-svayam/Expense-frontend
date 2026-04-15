import { Component } from '@angular/core';
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
export class AddExpenseModalComponent {

  form!: FormGroup;
  submitted = false;

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
    
    //Edit mode
    if(this.data){
      this.form.patchValue(this.data);
    }
  }

  get f() {
    return this.form.controls;
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
  this.submitted = true;

  if (this.form.invalid) return;

  const payload = {
    ...this.form.value,
    expense_date: this.form.value.date,
    payment_method: this.form.value.payment
  };

  this.budget.addExpense(payload).subscribe({
    next: (data) => {
      console.log("✅ Expense added:", data);
    },
    error: (err) => {
      console.log("❌ failed post api", err);
    }
  });

  this.dialogRef.close(payload);
}
}