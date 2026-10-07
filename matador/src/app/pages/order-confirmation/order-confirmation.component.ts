import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrderRequest } from '../../models/order-request.model';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.css'
})
export class OrderConfirmationComponent implements OnInit {
  orderRequest: OrderRequest | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['orderRequest']) {
        this.orderRequest = JSON.parse(params['orderRequest']);
      }
      else {
        this.router.navigate(['/']);
      }
    });
  }
}