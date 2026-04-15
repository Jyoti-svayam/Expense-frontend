import { Component, AfterViewInit, OnInit  } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { AddExpenseModalComponent } from '../add-expense-modal/add-expense-modal.component';
import { BudgetService } from 'src/app/core/services/budget.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SocketService } from 'src/app/core/services/socket.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  
  constructor(private dialog: MatDialog,
    private budget : BudgetService,
    private user :  AuthService,
    private socketService : SocketService
  ) {}
  userName = "";

  userBudget = 0;

  usedPercent = 0;

  userExpense = 0;

  remains = 0;

  warning = '';

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

  tableDataSource : any[] = [];
    categories: any[] = [];

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


  getUserdetails(){
    this.user.getUserDetails().subscribe({
      next : (userDetails : any)=>{
          console.log(userDetails.user.name);
          this.userName = userDetails.user.name;
      }
    })
  }


  getCurrentBudget(){
    this.budget.getCurrentBudget().subscribe({
      next : (currentBudget : any) => {
        console.log(currentBudget.amount_limit);
        this.userBudget = Number(currentBudget.amount_limit);
      },
      error : (err) =>{
        console.log(err);
      }
    });
  }

  getCurrentExpense(){
    this.budget.getTotalExpense().subscribe({
      next : (currentExpense : any) => {
        console.log(currentExpense.total);
       this.userExpense = Number(currentExpense.total);
      }
    })
  }

  

 remaining() {
  this.remains = this.userBudget - this.userExpense;
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
socketUpdate() {
  const userId = JSON.parse(localStorage.getItem('userId')!);
  console.log("userId:", userId);

  this.socketService.connect(userId);

  this.socketService.onExpenseUpdate().subscribe((data: any) => {
    console.log("Expense Update:", data);
     this.remains = data.remaining;
    this.usedPercent = data.usedPercent;
    this.warning = data.warning;
  });
}

getTableData() {
  this.budget.getAllExpense().subscribe({
    next: (res : any) => {
      console.log("Data:", res);
      this.tableDataSource = res.data;
    },
    error: (err) => {
      console.error("❌ Error:", err);
    }
  });
}

  loadCategories() {
    this.budget.getAllCategories().subscribe({
      next: (res :any) => {
        console.log("cate" ,res);
        this.categories = res;
      },
      error: (err) => {
        console.error("Error fetching categories", err);
      }
    });
  }

 ngOnInit(): void {
  this.socketUpdate();
  this.getTableData();
  this.getUserdetails();
  this.getCurrentBudget();
  this.getCurrentExpense();
  this.remaining();
  this.loadCategories();
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