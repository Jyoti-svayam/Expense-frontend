import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private router: Router) {}

  allowedRoutes = ['/dashboard', '/budget'];

  dashboardRoute = '/';

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

goToDashBoard(){
  if(this.isLoggedIn() && this.allowedRoutes.includes("/dashboard")){
    console.log("hiii")
    this.router.navigate(['/dashboard']);
  }else{
    console.log("error");
  }
}

dashboardHidden = () => {
  return this.router.url !== '/dashboard';
}

showLogout(): boolean {
  return this.isLoggedIn() && this.allowedRoutes.includes(this.router.url);
}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem("userId")
    this.router.navigate(['/']);
  }
}