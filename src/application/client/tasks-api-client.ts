import { TaskDTO } from "../dto/task-dto.js";
import { TokenDTO } from "../dto/token-dto.js";
import { TaskResultDTO } from "../dto/task-result-dto.js";

export interface TasksApiClient {
    getTaskToken(taskDTO: TaskDTO): Promise<TokenDTO>;
    getTask<TaskResponse>(tokenDTO: TokenDTO): Promise<TaskResponse>;
    reportAnswer<AnswerPayload>(tokenDTO: TokenDTO, answer: AnswerPayload): Promise<TaskResultDTO>;
}
