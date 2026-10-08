export interface OrderResponse {
    orderId: number;
    actionType: string;
    ticker: string;
    quantity: number;
    price: number;
    estimatedFee: number;
    orderStatus: string; // PENDING, FILLED, or REJECTED
}
