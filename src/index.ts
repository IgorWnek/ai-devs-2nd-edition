import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { SolveHelloApiTask, solveHelloApiTaskUseCase } from "./application/use-case/solve-hello-api-task-use-case.js";
import {
    SolveModerationTaskUseCase,
    solveModerationTaskUseCase
} from "./application/use-case/solve-moderation-task-use-case.js";
import { TaskResultDTO } from "./application/dto/task-result-dto.js";

async function main() {
    console.log(chalk.yellow(figlet.textSync('AI_Devs #2 CLI', {horizontalLayout: 'full'})));

    let appIsActive = true;
    while (appIsActive) {
        const action = await showMenu();

        if ('quit' === action) {
            appIsActive = false;
            console.log('Goodbye!');
            break;
        }

        await performAction(action);
    }
}

async function showMenu() {
    const response = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: [
                { name: 'Solve HelloAPI task', value: SolveHelloApiTask.TASK_NAME },
                { name: 'Solve Moderation task', value: SolveModerationTaskUseCase.TASK_NAME },
                { name: 'Quit', value: 'quit' },
            ]
        }
    ]);

    return response.action;
}

async function performAction(action: string): Promise<void> {
    let taskResultDTO: null | TaskResultDTO = null;

    if (SolveHelloApiTask.TASK_NAME === action) {
        taskResultDTO = await solveHelloApiTaskUseCase.execute();
    } else if (SolveModerationTaskUseCase.TASK_NAME === action) {
        taskResultDTO = await solveModerationTaskUseCase.execute();
    }

    if (taskResultDTO && taskResultDTO.solved) {
        console.log(chalk.greenBright(`${action} task solved!`));
    } else {
        console.log(chalk.red(`Answer for ${action} task is not correct!`));
    }

    return;
}

main().catch((error) => {
    console.error('Fatal error', error);
    process.exit(1);
});