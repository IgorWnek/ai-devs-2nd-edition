import { SolveTaskUseCase } from './solve-task-use-case.js';
import { TaskResultDTO } from '../dto/task-result-dto.js';
import { TasksApiClient } from '../client/tasks-api-client.js';
import { ModerationApiClient } from '../client/moderation-api-client.js';
import { TaskDTO } from '../dto/task-dto.js';
import { aiDevsTasksApiClient } from '../../infrastructure/ai-devs/client/ai-devs-tasks-api-client.js';
import { openAiModerationApiClient } from '../../infrastructure/openai/client/open-ai-moderation-api-client.js';

interface SolveModerationTaskUseCasePayload {
  tasksApiClient: TasksApiClient;
  openaiModerationApiClient: ModerationApiClient;
}

interface ModerationTaskResponse {
  code: number;
  msg: string;
  input: string[];
}

interface ModerationAnswerPayload {
  answer: number[];
}

export class SolveModerationTaskUseCase implements SolveTaskUseCase<TaskResultDTO> {
  public static TASK_NAME = 'moderation';

  public constructor(private dependencies: SolveModerationTaskUseCasePayload) {}

  public async execute(): Promise<TaskResultDTO> {
    const { tasksApiClient, openaiModerationApiClient } = this.dependencies;
    const taskDTO = new TaskDTO({
      name: SolveModerationTaskUseCase.TASK_NAME,
    });
    const taskTokenDTO = await tasksApiClient.getTaskToken(taskDTO);
    const taskResponse = await tasksApiClient.getTask<ModerationTaskResponse>({
      taskType: 'basic',
      token: taskTokenDTO,
    });

    const moderationResultDTO = await openaiModerationApiClient.moderateContent(taskResponse.input);
    const answer = moderationResultDTO.map((resultDTO) => Number(resultDTO.flagged));
    const moderationAnswerPayload: ModerationAnswerPayload = {
      answer,
    };

    return await tasksApiClient.reportAnswer<ModerationAnswerPayload>(taskTokenDTO, moderationAnswerPayload);
  }
}

export const solveModerationTaskUseCase: SolveTaskUseCase<TaskResultDTO> = new SolveModerationTaskUseCase({
  tasksApiClient: aiDevsTasksApiClient,
  openaiModerationApiClient: openAiModerationApiClient,
});
