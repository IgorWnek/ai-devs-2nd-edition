import { SolveTaskUseCase } from './solve-task-use-case.js';
import { TaskResultDTO } from '../dto/task-result-dto.js';
import { TasksApiClient } from '../client/tasks-api-client.js';
import { TaskDTO } from '../dto/task-dto.js';
import { aiDevsTasksApiClient } from '../../infrastructure/ai-devs/client/ai-devs-tasks-api-client.js';

interface SolveBloggerTaskUseCaseDependencies {
  tasksApiClient: TasksApiClient;
}

interface BloggerTaskContent {
  code: number;
  msg: string;
  blog: [string, string, string, string];
}

interface BloggerAnswerPayload {
  answer: string[];
}

export class SolveBloggerTaskUseCase implements SolveTaskUseCase<TaskResultDTO> {
  public static TASK_NAME = 'blogger';

  public constructor(private dependencies: SolveBloggerTaskUseCaseDependencies) {}

  public async execute(): Promise<TaskResultDTO> {
    const { tasksApiClient } = this.dependencies;

    const taskDTO = new TaskDTO({
      name: SolveBloggerTaskUseCase.TASK_NAME,
    });
    const taskTokenDTO = await tasksApiClient.getTaskToken(taskDTO);
    const bloggerTaskContent = await tasksApiClient.getTask<BloggerTaskContent>(taskTokenDTO);

    // todo: logic

    const answerPayload: BloggerAnswerPayload = {
      answer: [],
    };

    return await tasksApiClient.reportAnswer<BloggerAnswerPayload>(taskTokenDTO, answerPayload);
  }
}

export const solveBloggerTaskUseCase: SolveTaskUseCase<TaskResultDTO> = new SolveBloggerTaskUseCase({
  tasksApiClient: aiDevsTasksApiClient,
});
