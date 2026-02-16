import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GalleryModule } from './modules/gallery.module';
import { SharedModule } from './modules/shared.module';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AuthService } from './services/auth.service';

// PROBLEM: HttpClientModule is deprecated in Angular 19, should use provideHttpClient()
// PROBLEM: No lazy loading
// PROBLEM: Routes defined inline instead of separate file
const routes: Routes = [
  { path: '', redirectTo: '/gallery', pathMatch: 'full' },
  { path: 'gallery', component: HeaderComponent }, // BUG: Wrong component for route
  { path: 'profile', component: UserProfileComponent },
  { path: '**', redirectTo: '/gallery' } // PROBLEM: No 404 page
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    UserProfileComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule, // PROBLEM: Deprecated
    FormsModule,
    RouterModule.forRoot(routes),
    GalleryModule,
    SharedModule,
  ],
  providers: [
    AuthService, // PROBLEM: Should use providedIn: 'root'
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
