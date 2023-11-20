import { TaskDTO } from '../dto/task-dto.js';
import { TokenDTO } from '../dto/token-dto.js';
import { TaskResultDTO } from '../dto/task-result-dto.js';

type BasicTaskOptions = {
  taskType: 'basic';
};

type AdvancedTaskOptions = {
  taskType: 'advanced';
  headers?: { [key: string]: string };
  data?: string | FormData | Record<string, unknown>;
};

export type TaskOptions = {
  token: TokenDTO;
} & (BasicTaskOptions | AdvancedTaskOptions);

export interface TasksApiClient {
  getTaskToken(taskDTO: TaskDTO): Promise<TokenDTO>;
  getTask<TaskResponse>(options: TaskOptions): Promise<TaskResponse>;
  reportAnswer<AnswerPayload>(tokenDTO: TokenDTO, answer: AnswerPayload): Promise<TaskResultDTO>;
}
