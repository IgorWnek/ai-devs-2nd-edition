interface TaskDTOPayload {
    name: string;
}

export class TaskDTO {
    public name: string;

    public constructor(public payload: TaskDTOPayload) {
        this.name = payload.name;
    }
}
