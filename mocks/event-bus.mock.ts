export class EventBusMock {

    published: any;

    publish(event: any) {
        this.published = event;
    }

}