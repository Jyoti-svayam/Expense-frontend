

// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { MatDialog } from '@angular/material/dialog';
import { AddExpenseModalComponent } from '../add-expense-modal/add-expense-modal.component';
import { BudgetService } from 'src/app/core/services/budget.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SocketService } from 'src/app/core/services/socket.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AiSummaryModalComponent } from '../ai-summary-modal/ai-summary-modal.component';
import { ActivatedRoute, Router } from '@angular/router';


Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  constructor(
    private dialog: MatDialog,
    private budget: BudgetService,
    private user: AuthService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  userName = "";
  userBudget = 0;
  usedPercent = 0;
  userExpense = 0;
  remainsBudget = 0;
  warning = '';

  selectedDeleteIndex: number | null = null;
  selectedExpenseId: number | null = null;
  selectedNote: string | null = null;
  totalRecords = 0;
  selectedSort: string = 'latest';

  private expenseChart: Chart<any, any, any> | null = null;

  displayedColumns: string[] = [
    'title', 'amount', 'category', 'date',
    'payment', 'notes', 'update', 'delete'
  ];

  selectedCategory: string = '';
categoryList: string[] = [];


  categories: any[] = [];
  tableDataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // ================= USER =================
  getUserdetails() {
    this.user.getUserDetails().subscribe({
      next: (userDetails: any) => { this.userName = userDetails.user.name; }
    });
  }

  // ================= BUDGET =================
  getCurrentBudget() {
    this.budget.getCurrentBudget().subscribe({
      next: (res: any) => {
        this.userBudget = Number(res.amount_limit);
        this.remaining();
      }
    });
  }

  // ================= EXPENSE =================
  getCurrentExpense() {
    this.budget.getTotalExpense().subscribe({
      next: (res: any) => {
        this.userExpense = Number(res.totalExpense);
        this.remaining();
        setTimeout(() => this.renderChart(), 100);
      }
    });
  }

  remaining() {
    this.remainsBudget = this.userBudget - this.userExpense;
  }

  // ================= CHART =================
  renderChart() {
    if (this.expenseChart) {
      this.expenseChart.destroy();
      this.expenseChart = null;
    }

    const expenses = this.tableDataSource.data;
    const categoryMap: { [key: string]: number } = {};
    expenses.forEach((e: any) => {
      const cat = e.category || 'Others';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
    });

    const labels = Object.keys(categoryMap);
    const values = Object.values(categoryMap) as number[];
    const total = values.reduce((a, b) => a + b, 0);

    if (labels.length === 0) return;

    const colors = ['#4caf50', '#ff9800', '#9c27b0', '#2196f3', '#f44336', '#00bcd4', '#795548'];
    const remaining = this.remainsBudget > 0 ? this.remainsBudget : 0;
    const userBudget = this.userBudget;

    // ✅ Custom plugin
    const datalabelsPlugin = {
      id: 'customLabels',
      afterDatasetDraw(chart: any) {
        const { ctx, data } = chart;

        // --- OUTER RING: Category name + Amount + % ---
        const outerMeta = chart.getDatasetMeta(0);
        const outerDataset = data.datasets[0];
        const totalVal = outerDataset.data.reduce((a: number, b: number) => a + b, 0);

        outerMeta.data.forEach((arc: any, index: number) => {
          const value = outerDataset.data[index];
          const label = data.labels[index];
          const pct = Math.round((value / totalVal) * 100);
          if (pct < 4) return;

          const midAngle = (arc.startAngle + arc.endAngle) / 2;
          const radius = (arc.outerRadius + arc.innerRadius) / 2;
          const x = arc.x + Math.cos(midAngle) * radius;
          const y = arc.y + Math.sin(midAngle) * radius;

          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.font = 'bold 11px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(label, x, y - 14);

          ctx.font = 'bold 10px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('₹' + value.toLocaleString('en-IN'), x, y);

          ctx.font = '10px Arial';
          ctx.fillStyle = '#ffffffcc';
          ctx.fillText(pct + '%', x, y + 13);

          ctx.restore();
        });

        // --- INNER RING: Spent + Remaining ---
        const innerMeta = chart.getDatasetMeta(1);
        const innerDataset = data.datasets[1];

        innerMeta.data.forEach((arc: any, index: number) => {
          const value = innerDataset.data[index];
          const sliceLabel = index === 0 ? 'Spent' : 'Remaining';

          const arcAngle = arc.endAngle - arc.startAngle;
          if (arcAngle < 0.3) return;

          const midAngle = (arc.startAngle + arc.endAngle) / 2;
          const radius = (arc.outerRadius + arc.innerRadius) / 2;
          const x = arc.x + Math.cos(midAngle) * radius;
          const y = arc.y + Math.sin(midAngle) * radius;

          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.font = 'bold 10px Arial';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(sliceLabel, x, y - 7);

          ctx.font = '9px Arial';
          ctx.fillStyle = '#ffffffdd';
          ctx.fillText('₹' + value.toLocaleString('en-IN'), x, y + 6);

          ctx.restore();
        });

        // --- CENTER: Monthly Budget text ---
        const anySomeMeta = chart.getDatasetMeta(1);
        if (anySomeMeta.data.length > 0) {
          const arc = anySomeMeta.data[0];
          const centerX = arc.x;
          const centerY = arc.y;
          const cutout = chart.options.cutout;
          const cutoutPx = typeof cutout === 'string'
            ? (parseFloat(cutout) / 100) * arc.outerRadius
            : cutout;

          // Sirf center mein likho agar cutout kaafi bada ho
          if (cutoutPx > 40) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = '10px Arial';
            ctx.fillStyle = '#888888';
            ctx.fillText('Monthly Budget', centerX, centerY - 12);

            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#333333';
            ctx.fillText('₹' + userBudget.toLocaleString('en-IN'), centerX, centerY + 8);

            ctx.restore();
          }
        }
      }
    };

    this.expenseChart = new Chart("expenseChart", {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          // ✅ OUTER RING - Categories
          {
            label: 'Expenses',
            data: values,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 8,
            weight: 2
          },
          // ✅ INNER RING - Spent (red) + Remaining (teal)
          {
            label: 'Budget',
            data: [total, remaining],
            backgroundColor: ['#ef5350', '#26a69a'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4,
            weight: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '38%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 14,
              font: { size: 12 },
              usePointStyle: true,
              pointStyleWidth: 10,
              generateLabels: (chart: any) => {
                // Outer ring - categories
                const legendItems = labels.map((label, i) => ({
                  text: `${label}  ₹${values[i].toLocaleString('en-IN')}`,
                  fillStyle: colors[i],
                  strokeStyle: colors[i],
                  pointStyle: 'rect' as any,
                  index: i,
                  datasetIndex: 0
                }));

                // Inner ring - Spent
                legendItems.push({
                  text: `Spent  ₹${total.toLocaleString('en-IN')}`,
                  fillStyle: '#ef5350',
                  strokeStyle: '#ef5350',
                  pointStyle: 'rect' as any,
                  index: 0,
                  datasetIndex: 1
                });

                // Inner ring - Remaining
                legendItems.push({
                  text: `Remaining  ₹${remaining.toLocaleString('en-IN')}`,
                  fillStyle: '#26a69a',
                  strokeStyle: '#26a69a',
                  pointStyle: 'rect' as any,
                  index: 1,
                  datasetIndex: 1
                });

                // Monthly Budget - sirf text, no slice
                legendItems.push({
                  text: `Monthly Budget  ₹${this.userBudget.toLocaleString('en-IN')}`,
                  fillStyle: '#5c6bc0',
                  strokeStyle: '#5c6bc0',
                  pointStyle: 'rect' as any,
                  index: 2,
                  datasetIndex: 1
                });

                return legendItems;
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const val = ctx.parsed;
                if (ctx.datasetIndex === 1) {
                  return ctx.dataIndex === 0
                    ? ` Spent: ₹${val.toLocaleString('en-IN')}`
                    : ` Remaining: ₹${val.toLocaleString('en-IN')}`;
                }
                const pct = Math.round((val / total) * 100);
                return ` ₹${val.toLocaleString('en-IN')} (${pct}%)`;
              }
            }
          }
        }
      },
      plugins: [datalabelsPlugin]
    } as any);
  }

  // ================= TABLE =================
  getTableData(page: number = 1) {
    let sort: any = "";
    if (this.selectedSort === 'latest') sort = "latest";
    else if (this.selectedSort === 'high') sort = "high";
    else if (this.selectedSort === 'low') sort = "low";

    this.budget.getAllExpense(sort, page, this.selectedCategory).subscribe({
      next: (res: any) => {
        this.tableDataSource = new MatTableDataSource(res.data);
// const allCats = res.data.map((e: any) => e.category);
// this.categoryList = [...new Set(allCats)] as string[];

        this.totalRecords = res.total;
        this.tableDataSource.paginator = this.paginator;
        setTimeout(() => {
          if (this.paginator) {
            this.paginator.length = res.total;
            this.paginator.pageIndex = page - 1;
            this.paginator.pageSize = 5;
          }
        }, 300);
        setTimeout(() => this.renderChart(), 100);
      },
      error: (err) => console.error(err)
    });
  }

  onPageChange(event: any) {
    const page = event.pageIndex + 1;
    this.router.navigate(['/dashboard/page', page]);
  }

  applySort(type: string) {
    this.selectedSort = type;
    this.getTableData();
  }

filterByCategory(category: string) {
  this.selectedCategory = category;
  this.getTableData(1);
}



  getSortLabel(): string {
    const map: any = { latest: 'Latest', high: 'High → Low', low: 'Low → High' };
    return map[this.selectedSort];
  }

  // ================= ADD =================
  openAddExpense() {
    const dialogRef = this.dialog.open(AddExpenseModalComponent, {
      width: '40vw', height: '70vh', maxWidth: '95vw',
      panelClass: 'custom-dialog', disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentPage = Number(this.route.snapshot.params['page']) || 1;
        this.getTableData(currentPage);
        this.getCurrentExpense();
        this.router.navigate(['/dashboard/page', currentPage]);
      }
    });
  }

  // ================= EDIT =================
  openEditExpense(element: any) {
    const dialogRef = this.dialog.open(AddExpenseModalComponent, {
      width: '40vw', height: '70vh',
      data: { ...element }, panelClass: 'custom-dialog', disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentPage = Number(this.route.snapshot.params['page']) || 1;
        this.getTableData(currentPage);
        this.getCurrentExpense();
        this.router.navigate(['/dashboard/page', currentPage]);
      }
    });
  }

  // ================= DELETE =================
  openDeleteDialog(expense: any) {
    this.selectedDeleteIndex = this.tableDataSource.data.indexOf(expense);
    this.selectedExpenseId = expense.id;
  }

  closeDeleteDialog() {
    this.selectedDeleteIndex = null;
    this.selectedExpenseId = null;
  }

  deleteExpense() {
    if (!this.selectedExpenseId) return;
    this.budget.deleteExpense(this.selectedExpenseId).subscribe({
      next: () => {
        const currentPage = Number(this.route.snapshot.params['page']) || 1;
        this.getTableData(currentPage);
        this.getCurrentExpense();
        this.closeDeleteDialog();
      },
      error: (err) => console.error(err)
    });
  }

  // ================= NOTES =================
  openNotes(note: string) { this.selectedNote = note; }
  closeNotes() { this.selectedNote = null; }

  // ================= SOCKET =================
  socketUpdate() {
    const userId = JSON.parse(localStorage.getItem('userId')!);
    this.socketService.connect(userId);
    this.socketService.onExpenseUpdate().subscribe((data: any) => {
      this.usedPercent = data.usedPercent;
      this.warning = data.warning;
      this.remainsBudget = data.remaining;
      setTimeout(() => this.renderChart(), 100);
    });
  }

  // ================= CATEGORY =================
  loadCategories() {
    this.budget.getUserCategories().subscribe({
      next: (res: any) => {
       this.categories = res.categories; 
        this.categoryList = res.categories; 
      }
    });
  }

  
  // ================= INIT =================
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const page = Number(params['page']) || 1;
      this.selectedSort = 'latest';
      this.getTableData(page);
      setTimeout(() => {
        if (this.paginator) this.paginator.pageIndex = page - 1;
      }, 0);
    });
    this.getUserdetails();
    this.getCurrentBudget();
    this.getCurrentExpense();
    this.loadCategories();
  }

  // ================= AFTER VIEW =================
  ngAfterViewInit(): void {
    this.socketUpdate();
  }

  // ================= AI SUMMARY =================
  openAiSummary() {
    this.dialog.open(AiSummaryModalComponent, {
      width: '50vw', height: '70vh',
      panelClass: 'custom-dialog', disableClose: false
    });
  }

// ================= EXPORT EXCEL =================
// exportToExcel() {
//   this.budget.getAllExpense(this.selectedSort, 1, 10000).subscribe((res: any) => {

//     const data = res.data.map((e: any) => ({
//       Title: e.title,
//       Amount: e.amount,
//       Category: e.category,
//       Date: e.expense_date,
//       Payment: e.payment_method,
//       Notes: e.notes
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

//     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

//     const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

//     saveAs(blob, 'All_Expenses.xlsx');
//   });
// }



// ================= EXPORT PDF =================
exportToPDF() {
 this.budget.getAllExpense(this.selectedSort, 1, '', 1000).subscribe((res: any) => {

    const data = res.data;

    const doc = new jsPDF();

    // ✅ Title
    doc.setFontSize(16);
    doc.text('Expense Report', 14, 15);

    // ✅ Date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    // ✅ Total Amount
    const total = data.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    doc.text('Total Expense: Rs ' + total, 14, 28);
    // ✅ Table
    autoTable(doc, {
      startY: 35,
      head: [['Title', 'Amount', 'Category', 'Date', 'Payment', 'Notes']],
      body: data.map((e: any) => [
        e.title,
        'Rs ' + Number(e.amount),
        // `₹${e.amount}`,
        e.category,
        e.expense_date,
        e.payment_method,
        e.notes
      ]),
      styles: {
        fontSize: 9
      },
      headStyles: {
        fillColor: [41, 128, 185] // blue header
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240] // light gray rows
      }
    });

    // ✅ Save
    doc.save('Expense_Report.pdf');
  });
}

}