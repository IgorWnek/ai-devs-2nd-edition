import { TaskOptions, TasksApiClient } from '../../../application/client/tasks-api-client.js';
import { TaskDTO } from '../../../application/dto/task-dto.js';
import { TokenDTO } from '../../../application/dto/token-dto.js';
import axios, { AxiosResponse } from 'axios';
import { TaskResultDTO } from '../../../application/dto/task-result-dto.js';
import aiDevsConfig, { AiDevsConfig } from '../../../config/tasks-api/ai-devs-config.js';

interface AiDevsTaskApiClientDependencies {
  aiDevsConfig: AiDevsConfig;
}

interface TaskTokenResponse {
  code: number;
  msg: string;
  token: string;
}

interface AnswerResponse {
  code: number;
}

// to train TS typing
// mapped types mixed with template literal types
type TaskEndpointParams = {
  taskName: string;
};

type TaskTokenEndpointUrl<T extends keyof TaskEndpointParams> = T extends 'taskName'
  ? `/token/${TaskEndpointParams[T]}`
  : never;

type TaskContentEndpointParams = {
  taskToken: string;
};

type TaskContentEndpointUrl<T extends keyof TaskContentEndpointParams> = T extends 'taskToken'
  ? `/task/${TaskContentEndpointParams[T]}`
  : never;

// template literal types - simpler alternative, less descriptive
type AnswerEndpointPath = `/answer/${string}`;

export class AiDevsTasksApiClient implements TasksApiClient {
  private static AI_DEVS_URL = 'https://zadania.aidevs.pl';

  public constructor(private dependencies: AiDevsTaskApiClientDependencies) {}

  public async getTaskToken(taskDTO: TaskDTO): Promise<TokenDTO> {
    const { apiKey } = this.dependencies.aiDevsConfig;
    const tokenEndpointPath: TaskTokenEndpointUrl<'taskName'> = `/token/${taskDTO.name}`;
    const tokenEndpointUrl = AiDevsTasksApiClient.AI_DEVS_URL + tokenEndpointPath;

    const taskTokenResponse = await axios.post<TaskTokenResponse>(tokenEndpointUrl, {
      apikey: apiKey,
    });
    const { token } = taskTokenResponse.data;

    return new TokenDTO({ value: token });
  }

  public async getTask<TaskResponse>(options: TaskOptions): Promise<TaskResponse> {
    const taskToken = options.token.value;
    const taskContentEndpointPath: TaskContentEndpointUrl<'taskToken'> = `/task/${taskToken}`;
    const taskContentApiEndpointUrl = AiDevsTasksApiClient.AI_DEVS_URL + taskContentEndpointPath;
    let taskResponse: AxiosResponse<TaskResponse> | undefined;

    if (options.taskType === 'basic') {
      taskResponse = await axios.get<TaskResponse>(taskContentApiEndpointUrl);
    } else if (options.taskType === 'advanced') {
      taskResponse = await axios.post(taskContentApiEndpointUrl, options.data, {
        headers: {
          ...options.headers,
        },
      });
    }

    if (typeof taskResponse === 'undefined') {
      // todo: that might be a specific error
      throw new Error('Task API client is missing required task response');
    }

    return taskResponse.data;
  }

  public async reportAnswer<AnswerPayload>(tokenDTO: TokenDTO, answer: AnswerPayload): Promise<TaskResultDTO> {
    const answerEndpointPath: AnswerEndpointPath = `/answer/${tokenDTO.value}`;
    const answerEndpointUrl = AiDevsTasksApiClient.AI_DEVS_URL + answerEndpointPath;

    const answerResponse = await axios.post<AnswerResponse>(answerEndpointUrl, answer);
    const { code } = answerResponse.data;

    let solved = false;

    if (0 === code) {
      solved = true;
    }

    return new TaskResultDTO({ solved });
  }
}

export const aiDevsTasksApiClient: TasksApiClient = new AiDevsTasksApiClient({
  aiDevsConfig: aiDevsConfig,
});
