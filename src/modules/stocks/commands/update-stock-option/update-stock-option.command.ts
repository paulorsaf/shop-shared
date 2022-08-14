export class UpdateStockOptionCommand {
    constructor(
        public readonly companyId: string,
        public readonly productId: string,
        public readonly stockId: string,
        public readonly stockOptionId: string,
        public readonly stockOption: StockOptionDTO,
        public readonly updatedBy: string
    ){}
}

type StockOptionDTO = {
    quantity: number,
    color?: string,
    size?: string
}