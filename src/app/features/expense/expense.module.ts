import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ExpenseListComponent } from './expense-list/expense-list.component';



@NgModule({
  declarations: [
    AddExpenseComponent,
    ExpenseListComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ExpenseModule { }
