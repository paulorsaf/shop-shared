export class Product {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly categoryId: string,
        public readonly price: number,
        public readonly priceWithDiscount: number,
        public readonly companyId: string,
        public readonly stock: number,
        public readonly createdBy: string,
        public readonly createdAt: string,
        public readonly updatedAt?: string,
        public readonly updatedBy?: string
    ){}
}