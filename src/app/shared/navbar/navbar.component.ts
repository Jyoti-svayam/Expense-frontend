import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

const THEME_STORAGE_KEY = 'appTheme';
const LEGACY_THEME_KEY = 'dashboardTheme';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private router: Router) {}

  isDarkTheme = false;

  ngOnInit(): void {
    const saved =
      localStorage.getItem(THEME_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_THEME_KEY);
    this.isDarkTheme = saved === 'dark';
    this.applyThemeClass();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem(
      THEME_STORAGE_KEY,
      this.isDarkTheme ? 'dark' : 'light'
    );
    this.applyThemeClass();
  }

  private applyThemeClass(): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /** True when current URL is any dashboard route (including /dashboard/page/:page). */
  private isOnDashboard(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/dashboard' || path.startsWith('/dashboard/');
  }

  /** True when on budget setup page. */
  private isOnBudget(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/budget';
  }

goToDashBoard(){
  if (this.isLoggedIn()) {
    this.router.navigate(['/dashboard']);
  }
}

dashboardHidden = () => {
  return !this.isOnDashboard();
}

showLogout(): boolean {
  return this.isLoggedIn() && (this.isOnDashboard() || this.isOnBudget());
}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem("userId")
    this.router.navigate(['/']);
  }
}