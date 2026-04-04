import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class BudgetService {

  private baseUrl = `${environment.apiUrl}/budget`;

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
}