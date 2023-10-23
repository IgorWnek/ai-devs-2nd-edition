import { TaskResultDTO } from "../dto/task-result-dto.js";
import { SolveTaskUseCase } from "./solve-task-use-case.js";
import { TasksApiClient } from "../client/tasks-api-client.js";
import { aiDevsTasksApiClient } from "../../infrastructure/client/ai-devs-tasks-api-client.js";
import { TaskDTO } from "../dto/task-dto.js";

interface SolveHelloApiTaskDependencies {
    tasksApiClient: TasksApiClient;
}

interface HelloApiTaskResponse {
    code: number;
    msg: string;
    cookie: string;
}

interface HelloApiAnswerPayload {
    answer: string;
}

class SolveHelloApiTask implements SolveTaskUseCase<TaskResultDTO> {
    public constructor(private dependencies: SolveHelloApiTaskDependencies) {}

    public async execute(): Promise<TaskResultDTO> {
        const { tasksApiClient } = this.dependencies;
        const taskDTO = new TaskDTO({
            name: 'helloapi',
        });
        const tokenDTO = await tasksApiClient.getTaskToken(taskDTO);
        const taskResponse = await tasksApiClient.getTask<HelloApiTaskResponse>(tokenDTO);

        return await tasksApiClient.reportAnswer<HelloApiAnswerPayload>(tokenDTO, { answer: taskResponse.cookie });
    }
}

export const solveHelloApiTaskUseCase: SolveTaskUseCase<TaskResultDTO> = new SolveHelloApiTask({
    tasksApiClient: aiDevsTasksApiClient,
});
