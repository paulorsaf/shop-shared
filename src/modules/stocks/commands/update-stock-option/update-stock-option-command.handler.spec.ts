import { CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { EventBusMock } from '../../../../../mocks/event-bus.mock';
import { UpdateStockOptionCommand } from './update-stock-option.command';
import { UpdateStockOptionCommandHandler } from './update-stock-option-command.handler';
import { StockRepository } from '../../repositories/stock.repository';
import { NotFoundException } from '@nestjs/common';
import { StockOptionUpdatedEvent } from './events/stock-option-updated.event';
import { Stock, StockOption } from '../../entities/stock';
import { StockWithSameConfigurationException } from '../../exceptions/stock-with-same-configuration.exception';

describe('UpdateStockOptionCommandHandler', () => {

  let handler: UpdateStockOptionCommandHandler;
  let stockRepository: StockRepositoryMock;
  let eventBus: EventBusMock;

  const command = new UpdateStockOptionCommand(
    'anyCompanyId', 'anyProductId', 'anyStockId', 'anyStockOptionId', {
      quantity: 10, color: 'anyColor', size: 'anySize'
    }, 'anyUserId'
  );

  beforeEach(async () => {
    eventBus = new EventBusMock();
    stockRepository = new StockRepositoryMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        UpdateStockOptionCommandHandler
      ],
      imports: [
        CqrsModule
      ],
      providers: [
        StockRepository
      ]
    })
    .overrideProvider(StockRepository).useValue(stockRepository)
    .overrideProvider(EventBus).useValue(eventBus)
    .compile();

    handler = module.get<UpdateStockOptionCommandHandler>(UpdateStockOptionCommandHandler);
  });

  it('given product stock not found, then throw not found exception', async () => {
    stockRepository.response = null;

    await expect(handler.execute(command)).rejects.toThrowError(NotFoundException);
  });

  describe('given product stock found', () => {

    let stockOption: any;

    beforeEach(() => {
      stockOption = {
        id: "anyStockOptionId", amount: 5, color: 'anyOtherColor', size: 'anyOtherSize'
      };
      stockRepository.response = {
        id: "anyStockId", companyId: "anyCompanyId", stockOptions: [stockOption]
      };
    })

    it('when stock option not found, then throw not found exception', async () => {
      stockOption.id = "anyOtherStockOptionId";

      await expect(handler.execute(command)).rejects.toThrowError(NotFoundException);
    });
  
    it('when stock option found, then update stock option', async () => {
      await handler.execute(command);
  
      expect(stockRepository.updatedWith).toEqual({
        stockId: command.stockId, originalStockOption: stockOption, stockOption: {
          id: command.stockOptionId, ...command.stockOption
        }
      });
    });
  
    it('when stock option updated, then publish stock option updated event', async () => {
      await handler.execute(command);
  
      expect(eventBus.published).toEqual(
        new StockOptionUpdatedEvent(
          command.companyId, command.productId, command.stockId, stockOption, {
            id: command.stockOptionId,
            quantity: command.stockOption.quantity,
            color: command.stockOption.color,
            size: command.stockOption.size
          }, command.updatedBy
        )
      );
    });

    it('when stock with same configuration already exists, then throw error', async () => {
      stockRepository.response = new Stock('anyCompanyId', 'anyProductId', 'anyId', [
        new StockOption('anyId', 2, 'anyColor', 'anySize')
      ]);
  
      expect(handler.execute(command)).rejects.toThrowError(StockWithSameConfigurationException);
    });

  })

});

class StockRepositoryMock {

  addedWith: any;
  addedWithId: string;
  createdWith: any;
  removedWith: any;
  searchedById: string = "";
  updatedWith: any;

  response: any;

  findByProduct(productId: string) {
    this.searchedById = productId;
    return this.response;
  }
  updateStockOption(params: any) {
    this.updatedWith = params;
  }

}