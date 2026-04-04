import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { BudgetService } from '../services/budget.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BudgetGuard implements CanActivate {

  constructor(
    private budgetService: BudgetService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.budgetService.getCurrentBudget().pipe(
      map((res: any) => {
        if (res && res.amount_limit) {
          return true; // allow dashboard
        } else {
          this.router.navigate(['/budget']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/budget']);
        return of(false);
      })
    );
  }
}