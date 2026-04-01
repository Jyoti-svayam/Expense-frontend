import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingComponent } from './landing/landing.component';
import { SharedModule } from 'src/app/shared/shared.module'; // 👈 correct path
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    LandingComponent
  ],
  imports: [
    CommonModule,
    SharedModule ,
    RouterModule  // 🔥 REQUIRED
  ]
})
export class LandingModule {}