import { SolveTaskUseCase } from './solve-task-use-case.js';
import { TaskResultDTO } from '../dto/task-result-dto.js';
import { TasksApiClient } from '../client/tasks-api-client.js';
import { TaskDTO } from '../dto/task-dto.js';
import { aiDevsTasksApiClient } from '../../infrastructure/ai-devs/client/ai-devs-tasks-api-client.js';
import openAiConfig, { OpenAiConfig } from '../../config/open-ai/open-ai-config.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';
interface SolveLiarTaskUseCaseDependencies {
  tasksApiClient: TasksApiClient;
  openAiConfig: OpenAiConfig;
}

interface LiarTaskContent {
  code: number;
  msg: string;
  blog: [string, string, string, string];
}

type LiarAnswerPayload = string;

export class SolveLiarTaskUseCase implements SolveTaskUseCase<TaskResultDTO> {
  public static TASK_NAME = 'liar';

  private static QUESTION = 'Are there skyscrapers in the New York city?';

  private systemPrompt = `
`;

  private userPrompt = `

  `;

  public constructor(private dependencies: SolveLiarTaskUseCaseDependencies) {}

  public async execute(): Promise<TaskResultDTO> {
    const {
      tasksApiClient,
      openAiConfig: { apiKey: openAiApiKey },
    } = this.dependencies;

    const taskDTO = new TaskDTO({
      name: SolveLiarTaskUseCase.TASK_NAME,
    });
    const taskTokenDTO = await tasksApiClient.getTaskToken(taskDTO);

    const liarTaskContent = await tasksApiClient.getTask<LiarTaskContent>({
      taskType: 'advanced',
      token: taskTokenDTO,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        question: SolveLiarTaskUseCase.QUESTION,
      },
    });

    console.log(liarTaskContent);

    // TODO: write prompt to verify if the answer from task api is related somehow with the question

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', this.systemPrompt],
      ['human', this.userPrompt],
    ]);

    const formattedMessages = await chatPrompt.formatMessages({});

    const chat = new ChatOpenAI({ configuration: { apiKey: openAiApiKey } });
    const { content } = await chat.call(formattedMessages);

    const answerPayload: LiarAnswerPayload = content.toString();

    return await tasksApiClient.reportAnswer<LiarAnswerPayload>(taskTokenDTO, answerPayload);
  }
}

export const solveLiarTaskUseCase: SolveTaskUseCase<TaskResultDTO> = new SolveLiarTaskUseCase({
  tasksApiClient: aiDevsTasksApiClient,
  openAiConfig: openAiConfig,
});
