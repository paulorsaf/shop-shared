export class ProductStockUpdatedEvent {
    private readonly eventType = "PRODUCT_STOCK_UPDATED_EVENT";
    constructor(
        public readonly companyId: string,
        public readonly productId: string,
        public readonly amount: number,
        public readonly userId: string
    ){}

}