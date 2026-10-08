export interface OrderRequest {
    ticker: string;
    assetType: string;
    actionType: string;
    quantity: number;
    price: number;
    currency: string;
}