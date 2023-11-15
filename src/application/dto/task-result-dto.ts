export interface TaskResultDTOPayload {
  solved: boolean;
}

export class TaskResultDTO {
  public solved: boolean;

  public constructor(payload: TaskResultDTOPayload) {
    this.solved = payload.solved;
  }
}
