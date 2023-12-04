import { SolveTaskUseCase } from './solve-task-use-case.js';
import { TaskResultDTO } from '../dto/task-result-dto.js';
import { TasksApiClient } from '../client/tasks-api-client.js';
import { TaskDTO } from '../dto/task-dto.js';
import { aiDevsTasksApiClient } from '../../infrastructure/ai-devs/client/ai-devs-tasks-api-client.js';
import openAiConfig, { OpenAiConfig } from '../../config/open-ai/open-ai-config.js';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';

type SolveTaskUseCaseDependencies = {
  tasksApiClient: TasksApiClient;
  openAiConfig: OpenAiConfig;
};

type TaskContent = {
  code: number;
  msg: string;
  answer: string;
};

type AnswerPayload = {
  answer: string;
};

export class SolveInpromptTaskUseCase implements SolveTaskUseCase<TaskResultDTO> {
  public static TASK_NAME = 'inprompt';

  private static QUESTION = 'Are there skyscrapers in the New York city?';

  private systemPrompt = `
You are a part of a guarding system which main task is to assess whether the user's answer is at all relevant to the question asked by you.

Answer ultra succinctly with just one word:
- "yes" if there is a connection,
- "no" if there is none.

Question: {question}
`;

  private userPrompt = '{answer}';

  public constructor(private dependencies: SolveTaskUseCaseDependencies) {}

  public async execute(): Promise<TaskResultDTO> {
    const {
      tasksApiClient,
      openAiConfig: { apiKey: openAiApiKey },
    } = this.dependencies;

    const taskDTO = new TaskDTO({
      name: SolveInpromptTaskUseCase.TASK_NAME,
    });
    const taskTokenDTO = await tasksApiClient.getTaskToken(taskDTO);

    const questionForLiar = SolveInpromptTaskUseCase.QUESTION;
    console.log(`Question for the "liar": "${questionForLiar}"`);

    const liarTaskContent = await tasksApiClient.getTask<TaskContent>({
      taskType: 'advanced',
      token: taskTokenDTO,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: {
        question: questionForLiar,
      },
    });

    console.log(`Liar's answer: "${liarTaskContent.msg}"`);

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', this.systemPrompt],
      ['human', this.userPrompt],
    ]);

    const formattedMessages = await chatPrompt.formatMessages({
      question: SolveInpromptTaskUseCase.QUESTION,
      answer: liarTaskContent.answer,
    });

    const chat = new ChatOpenAI({ configuration: { apiKey: openAiApiKey } });
    const { content } = await chat.call(formattedMessages);

    const answerPayload: AnswerPayload = {
      answer: content.toString(),
    };

    console.log(`Guardrail verdict on whether the question is on topic: ${answerPayload}`);

    return await tasksApiClient.reportAnswer<AnswerPayload>(taskTokenDTO, answerPayload);
  }
}

export const solveInpromptTaskUseCase: SolveTaskUseCase<TaskResultDTO> = new SolveInpromptTaskUseCase({
  tasksApiClient: aiDevsTasksApiClient,
  openAiConfig: openAiConfig,
});
