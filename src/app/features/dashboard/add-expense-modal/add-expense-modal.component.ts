import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    private fb: FormBuilder
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

    this.dialogRef.close(this.form.value);
  }
}