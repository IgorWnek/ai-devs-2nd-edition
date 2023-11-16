import { SolveTaskUseCase } from './solve-task-use-case.js';
import { TaskResultDTO } from '../dto/task-result-dto.js';
import { TasksApiClient } from '../client/tasks-api-client.js';
import { TaskDTO } from '../dto/task-dto.js';
import { aiDevsTasksApiClient } from '../../infrastructure/ai-devs/client/ai-devs-tasks-api-client.js';
import openAiConfig, { OpenAiConfig } from '../../config/open-ai/open-ai-config.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';

interface SolveBloggerTaskUseCaseDependencies {
  tasksApiClient: TasksApiClient;
  openAiConfig: OpenAiConfig;
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

  private systemPrompt = `
Act as a world top pizza maker. You will be given with a titles of four chapters of an article for a blog
about creating the best pizza margherita. Your task is to write body of these blog chapters. Be concisely, your answer is limited to 300 characters per chapter.
Audience of this blog are the polish people so your chapters must be written in the polish language.
You are really fun, polite and you like polish cuisine. Show it in your chapters.

Important note: you must answer in the given json format:
{"answer":["text of the first chapter for 300 characters", "text of the second chapter for 300 characters", "text of the third chapter for 300 characters", "text of the fourth chapter for 300 characters"]}
  `;

  private userPrompt = `
Titles for blog chapters:
- {title1}
- {title2}
- {title3}
- {title4}
  `;

  public constructor(private dependencies: SolveBloggerTaskUseCaseDependencies) {}

  public async execute(): Promise<TaskResultDTO> {
    const {
      tasksApiClient,
      openAiConfig: { apiKey: openAiApiKey },
    } = this.dependencies;

    const taskDTO = new TaskDTO({
      name: SolveBloggerTaskUseCase.TASK_NAME,
    });
    const taskTokenDTO = await tasksApiClient.getTaskToken(taskDTO);
    const bloggerTaskContent = await tasksApiClient.getTask<BloggerTaskContent>(taskTokenDTO);

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', this.systemPrompt],
      ['human', this.userPrompt],
    ]);

    const formattedMessages = await chatPrompt.formatMessages({
      title1: bloggerTaskContent.blog[0],
      title2: bloggerTaskContent.blog[1],
      title3: bloggerTaskContent.blog[2],
      title4: bloggerTaskContent.blog[3],
    });

    const chat = new ChatOpenAI({ configuration: { apiKey: openAiApiKey } });
    const { content } = await chat.call(formattedMessages);

    // TODO finish the logic

    const answerPayload: BloggerAnswerPayload = this.handleJsonStringResponse('5');

    return await tasksApiClient.reportAnswer<BloggerAnswerPayload>(taskTokenDTO, answerPayload);
  }

  private handleJsonStringResponse(jsonString: string): BloggerAnswerPayload {
    try {
      const parsedData = JSON.parse(jsonString);
      // TODO: add a validation if parsedData object actually is this type

      return parsedData as BloggerAnswerPayload;
    } catch (error) {
      console.error('Error parsing JSON string:', error);
      throw new Error('Invalid JSON format');
    }
  }
}

export const solveBloggerTaskUseCase: SolveTaskUseCase<TaskResultDTO> = new SolveBloggerTaskUseCase({
  tasksApiClient: aiDevsTasksApiClient,
  openAiConfig: openAiConfig,
});
