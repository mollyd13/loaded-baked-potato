import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatList, MatListItem } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs';
import { AuthService } from '../services/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterOutlet,CommonModule,MatToolbarModule,MatSidenavModule, 
    MatIconModule, MatListItem, MatExpansionModule, RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  title = 'ng-sidebar-material';
  sidenavMode: 'side' | 'over' = 'side';
  constructor(private observer: BreakpointObserver, private router: Router, private cdr: ChangeDetectorRef,
    public auth: AuthService) {}

  signOut() {
    this.auth.logout().subscribe(() => this.router.navigate(['/sign-in']));
  }

  ngAfterViewInit() {
    this.observer.observe(["(max-width: 800px)"]).subscribe((res) => {
      if (res.matches) {
        this.sidenavMode = "over";
        this.sidenav.close();
      } else {
        this.sidenavMode = "side";
        this.sidenav.open();
      }
      this.cdr.detectChanges();
    });
    this.router.events
    .pipe(
      untilDestroyed(this),
      filter((e) => e instanceof NavigationEnd)
    )
    .subscribe(() => {
      if (this.sidenavMode === 'over') {
        this.sidenav.close();
      }
    });
  }
}