import { NotFoundException } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { Stock, StockOption } from "../../entities/stock";
import { StockWithSameConfigurationException } from "../../exceptions/stock-with-same-configuration.exception";
import { StockRepository } from "../../repositories/stock.repository";
import { StockOptionUpdatedEvent } from "./events/stock-option-updated.event";
import { UpdateStockOptionCommand } from "./update-stock-option.command";

@CommandHandler(UpdateStockOptionCommand)
export class UpdateStockOptionCommandHandler implements ICommandHandler<UpdateStockOptionCommand> {

    constructor(
        private eventBus: EventBus,
        private stockRepository: StockRepository
    ){}

    async execute(command: UpdateStockOptionCommand) {
        const stock = await this.findStock(command);

        if (this.hasStockWithSameConfiguration(stock, command)) {
            throw new StockWithSameConfigurationException();
        }

        const stockOption = await this.findStockOption(stock, command);
        
        const newStockOption = this.createStockOption(command);
        await this.stockRepository.updateStockOption({
            stockId: command.stockId,
            originalStockOption: stockOption,
            stockOption: newStockOption
        });

        this.publishStockOptionUpdatedEvent(command, stockOption, newStockOption);
    }

    private hasStockWithSameConfiguration(stock: Stock, command: UpdateStockOptionCommand) {
        return stock.stockOptions?.filter(
            option => option.id !== command.stockOptionId
        ).find(option =>
            option.color === command.stockOption.color &&
            option.size === command.stockOption.size
        );
    }

    private createStockOption(command: UpdateStockOptionCommand) {
        return new StockOption(
            command.stockOptionId, command.stockOption.quantity, command.stockOption.color,
            command.stockOption.size
        );
    }

    private publishStockOptionUpdatedEvent(
        command: UpdateStockOptionCommand, originalStockOption: StockOption, newStockOption: StockOption
    ) {
        this.eventBus.publish(
            new StockOptionUpdatedEvent(
                command.companyId, command.productId, command.stockId, originalStockOption,
                newStockOption, command.updatedBy
            )
        );
    }

    private async findStockOption(stock: Stock, command: UpdateStockOptionCommand) {
        const stockOption = stock.stockOptions.find(s => s.id === command.stockOptionId);
        if (!stockOption) {
            throw new NotFoundException();
        }
        return stockOption;
    }

    private async findStock(command: UpdateStockOptionCommand) {
        const stock = await this.stockRepository.findByProduct(command.productId);
        if (!stock) {
            throw new NotFoundException();
        }
        if (stock.companyId !== command.companyId) {
            throw new NotFoundException();
        }
        return stock;
    }

}