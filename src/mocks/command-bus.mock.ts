export class CommandBusMock {

    executed: any;

    execute(command: any) {
        this.executed = command;
    }

}