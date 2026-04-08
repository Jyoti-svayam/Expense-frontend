import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private baseUrl = `${environment.apiUrl}/budget`;

  private baseUrlExpense = `${environment.apiUrl}/expense`;

  constructor(private http: HttpClient) {}

  setBudget(data: any) {
    return this.http.post(`${this.baseUrl}/`, data);
  }

  getCurrentBudget() {
    return this.http.get(`${this.baseUrl}/`);
  }

  updateCurrentBudget(data : any){
    return this.http.post(`${this.baseUrl}/`, data);
  }

  getTotalExpense(){
  return this.http.get(`${this.baseUrlExpense}/`);
  }

  addExpense(data : any){
    return this.http.post(`${this.baseUrlExpense}/` , data);
  }
}