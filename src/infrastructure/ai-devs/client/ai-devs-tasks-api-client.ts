import { TasksApiClient } from "../../../application/client/tasks-api-client.js";
import { TaskDTO } from "../../../application/dto/task-dto.js";
import { TokenDTO } from "../../../application/dto/token-dto.js";
import axios from "axios";
import { TaskResultDTO } from "../../../application/dto/task-result-dto.js";
import aiDevsConfig, { AiDevsConfig } from "../../../config/tasks-api/ai-devs-config.js";

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

export class AiDevsTasksApiClient implements TasksApiClient {
    private static AI_DEVS_URL = 'https://zadania.aidevs.pl';

    public constructor(private dependencies: AiDevsTaskApiClientDependencies) {}

    public async getTaskToken(taskDTO: TaskDTO): Promise<TokenDTO> {
        const { apiKey } = this.dependencies.aiDevsConfig;
        const taskTokenResponse = await axios.post<TaskTokenResponse>(
            `${AiDevsTasksApiClient.AI_DEVS_URL}/token/${taskDTO.name}`,
            {
                apikey: apiKey,
            }
        );
        const { token } = taskTokenResponse.data;

        return new TokenDTO({ value: token });
    }

    public async getTask<TaskResponse>(tokenDTO: TokenDTO): Promise<TaskResponse> {
        const taskResponse = await axios.get<TaskResponse>(
            `${AiDevsTasksApiClient.AI_DEVS_URL}/task/${tokenDTO.value}`
        );

        return taskResponse.data;
    }

    public async reportAnswer<AnswerPayload>(tokenDTO: TokenDTO, answer: AnswerPayload): Promise<TaskResultDTO> {
        const answerResponse = await axios.post<AnswerResponse>(
            `${AiDevsTasksApiClient.AI_DEVS_URL}/answer/${tokenDTO.value}`,
            answer
        );
        const { code } = answerResponse.data;

        let solved = false;

        if (0 === code) {
            solved = true;
        }

        return new TaskResultDTO({ solved })
    }
}

export const aiDevsTasksApiClient: TasksApiClient = new AiDevsTasksApiClient({
    aiDevsConfig: aiDevsConfig,
});