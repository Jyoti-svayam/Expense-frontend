import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule} from "@angular/common/http"
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { LandingModule } from './features/landing/landing.module';
import { AuthModule } from './features/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { LottieModule } from 'ngx-lottie';
import * as player from 'lottie-web';

export function playerFactory() : any {
  return player;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
   LottieModule.forRoot({ player: playerFactory }),
     ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
     LandingModule,
     AuthModule,
     SharedModule,
     DashboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
