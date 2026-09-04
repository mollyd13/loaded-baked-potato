import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Sidebar } from './sidebar/sidebar';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Sidebar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'matador';
  isAuthRoute: boolean;

  constructor(private router: Router) {
    this.isAuthRoute = AUTH_ROUTES.includes(this.router.url);
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isAuthRoute = AUTH_ROUTES.includes(event.urlAfterRedirects);
      });
  }
}
