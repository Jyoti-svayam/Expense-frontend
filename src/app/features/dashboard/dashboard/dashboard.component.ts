import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { AddExpenseModalComponent } from '../add-expense-modal/add-expense-modal.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  
  constructor(private dialog: MatDialog) {}
  userName = "Vishal";

  budget = 5000;

  selectedNote: string | null = null;
  selectedDeleteIndex: number | null = null;

  categoryData = [
    { name: 'Food', value: 800 },
    { name: 'Travel', value: 600 },
    { name: 'Shopping', value: 1000 }
  ];

  displayedColumns: string[] = [
    'title',
    'amount',
    'category',
    'date',
    'payment',
    'notes',
    'update',
    'delete'
  ];

  dataSource = [
    {
      title: 'Lunch',
      amount: 200,
      category: 'Food',
      date: '2026-04-01',
      payment: 'UPI',
      notes: 'Had lunch at cafe with friends'
    },
    {
      title: 'Uber',
      amount: 150,
      category: 'Travel',
      date: '2026-04-02',
      payment: 'Card',
      notes: 'Office to home ride'
    }
  ];

  get totalExpense() {
    return this.categoryData.reduce((sum, c) => sum + c.value, 0);
  }

  get remaining() {
    return this.budget - this.totalExpense;
  }

  // Notes
  openNotes(note: string) {
    this.selectedNote = note;
  }

  closeNotes() {
    this.selectedNote = null;
  }

  // Update
 openEditExpense(element: any, index: number) {
  const dialogRef = this.dialog.open(AddExpenseModalComponent, {
    width: '40vw',
    height: '70vh',
    data: { ...element, index },   // ✅ data pass
    panelClass: 'custom-dialog',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.dataSource[index] = result;   // ✅ update row
      this.dataSource = [...this.dataSource]; // refresh table
    }
  });
}

  // Delete popup
  openDeleteDialog(index: number) {
    this.selectedDeleteIndex = index;
  }

  closeDeleteDialog() {
    this.selectedDeleteIndex = null;
  }

  confirmDelete() {
    if (this.selectedDeleteIndex !== null) {
      this.dataSource.splice(this.selectedDeleteIndex, 1);
      this.dataSource = [...this.dataSource];
      this.closeDeleteDialog();
    }
  }
openAddExpense() {
  const dialogRef = this.dialog.open(AddExpenseModalComponent, {
    width: '40vw',        // ✅ responsive width
    height: '70vh',       // ✅ height control
    maxWidth: '95vw',     // mobile safety
    panelClass: 'custom-dialog',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.dataSource = [...this.dataSource, result];
    }
  });
}

  ngAfterViewInit(): void {
    const labels = [
      ...this.categoryData.map(c => c.name),
      'Remaining'
    ];

    const values = [
      ...this.categoryData.map(c => c.value),
      this.remaining
    ];

   new Chart("expenseChart", {
  type: 'doughnut',
  data: {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: ['#4caf50', '#ff9800', '#9c27b0', '#e0e0e0']
      }
    ]
  },
  options: {
    responsive: true,              // ✅ MUST
    maintainAspectRatio: false,    // ✅ VERY IMPORTANT

    plugins: {
      legend: {
        position: 'bottom'         // better for mobile
      }
    }
  }
});
  }
}