export interface OrderRequest {
    user_id : number, 
    ticker: string,
    asset_type : string,
    action_type: string,
    order_type: string,
    quantity: number,
    price: number,
    timing: string,
    currency: string
}