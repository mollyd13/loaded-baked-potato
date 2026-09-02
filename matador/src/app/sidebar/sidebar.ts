import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatList, MatListItem, MatNavList } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterOutlet,CommonModule,MatToolbarModule,MatSidenavModule, 
    MatIconModule, MatDivider, MatNavList, MatListItem, MatExpansionModule, RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  title = 'ng-sidebar-material';
  sidenavMode: 'side' | 'over' = 'side';
  constructor(private observer: BreakpointObserver, private router: Router, private cdr: ChangeDetectorRef) {}
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