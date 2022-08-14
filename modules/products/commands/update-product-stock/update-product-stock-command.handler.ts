import { NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { ProductRepository } from "../../repositories/product.repository";
import { ProductStockUpdatedEvent } from "./events/product-stock-updated.event";
import { UpdateProductStockCommand } from "./update-product-stock.command";

@CommandHandler(UpdateProductStockCommand)
export class UpdateProductStockCommandHandler implements ICommandHandler<UpdateProductStockCommand> {

    constructor(
        private eventBus: EventBus,
        private productRepository: ProductRepository
    ){}

    async execute(command: UpdateProductStockCommand) {
        const product = await this.findProductByIdAndCompanyId(command);

        const amount = product.stock + command.amount;
        this.productRepository.updateStockAmount({amount, productId: command.productId});

        this.publishProductStockUpdatedEvent(command, amount);
    }

    private async findProductByIdAndCompanyId(command: UpdateProductStockCommand) {
        const product = await this.productRepository.findById(command.productId);
        if (!product) {
            throw new NotFoundException('Produto nao encontrado');
        }
        if (product.companyId !== command.companyId) {
            throw new NotFoundException('Produto nao encontrado');
        }
        return product;
    }

    private publishProductStockUpdatedEvent(command: UpdateProductStockCommand, amount: number) {
        this.eventBus.publish(
            new ProductStockUpdatedEvent(
                command.companyId, command.productId, amount, command.updatedBy
            )
        )
    }

}