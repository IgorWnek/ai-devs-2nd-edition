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
  input: string[];
  question: string;
};

type AnswerPayload = {
  answer: string;
};

export class SolveInpromptTaskUseCase implements SolveTaskUseCase<TaskResultDTO> {
  public static TASK_NAME = 'inprompt';

  private questionSystemPrompt = `
You are a smart guys who knows how to recognise what is the name of person referred to in a conversation.
Question will be in Polish language.
Basing on the question return only the name which is referred in there and nothing more.
Your response is a single string.
`;

  private questionUserPrompt = 'Question: {question}';

  private taskSystemPrompt = `
  You are really smart guy who is really got in concisely answers to the questions about other people.
  You will be given with few facts about person with some name.
  Later you will be asked the question about that person.
  You have to answer the question using only provided context.
  You are native speaker of polish language so this will be language of your answers.
  Answer concisely and politely.
  
  ### Facts
  {facts}
  `;

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

    const { input: taskInput, question: taskQuestion } = await tasksApiClient.getTask<TaskContent>({
      taskType: 'basic',
      token: taskTokenDTO,
    });

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', this.questionSystemPrompt],
      ['human', this.questionUserPrompt],
    ]);

    const formattedMessages = await chatPrompt.formatMessages({
      question: taskQuestion,
    });

    const chat = new ChatOpenAI({ configuration: { apiKey: openAiApiKey } });
    const { content } = await chat.call(formattedMessages);

    const theName = content.toString();

    const theSentences = taskInput.filter((sentence) => sentence.includes(theName));

    const taskChatPrompt = ChatPromptTemplate.fromMessages([
      ['system', this.taskSystemPrompt],
      ['human', this.questionUserPrompt],
    ]);

    const formattedTaskMessages = await taskChatPrompt.formatMessages({
      facts: theSentences.join(' '),
      question: taskQuestion,
    });

    const taskChat = new ChatOpenAI({ configuration: { apiKey: openAiApiKey } });
    const { content: taskAnswer } = await taskChat.call(formattedTaskMessages);

    const answerPayload: AnswerPayload = {
      answer: taskAnswer.toString(),
    };

    console.log(`Answer to the response is: ${answerPayload}`);

    return await tasksApiClient.reportAnswer<AnswerPayload>(taskTokenDTO, answerPayload);
  }
}

export const solveInpromptTaskUseCase: SolveTaskUseCase<TaskResultDTO> = new SolveInpromptTaskUseCase({
  tasksApiClient: aiDevsTasksApiClient,
  openAiConfig: openAiConfig,
});
