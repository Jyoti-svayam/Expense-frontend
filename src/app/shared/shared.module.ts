import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  exports: [
    NavbarComponent,   // ✅ THIS IS MUST
    FooterComponent
  ]
})
export class SharedModule {}