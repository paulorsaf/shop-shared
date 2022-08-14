import { BadRequestException } from "@nestjs/common";

export class StockWithSameConfigurationException extends BadRequestException {
    constructor() {
        super('Já existe uma opção de estoque com essa cor e tamanho. Atualize essa opção ao invés de criar uma nova.');
    }
}