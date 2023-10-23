import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { solveHelloApiTaskUseCase } from "./application/use-case/solve-hello-api-task-use-case.js";

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
                { name: 'Solve HelloAPI task', value: 'HelloAPI' },
                { name: 'Quit', value: 'quit' },
            ]
        }
    ]);

    return response.action;
}

async function performAction(action: string): Promise<void> {
    if (action === 'HelloAPI') {
        const taskResultDTO = await solveHelloApiTaskUseCase.execute();

        if (taskResultDTO.solved) {
            console.log(chalk.greenBright('HelloAPI task solved!'));
        } else {
            console.log(chalk.red('Answer for HelloAPI task is not correct!'));
        }
    }

    return;
}

main().catch((error) => {
    console.error('Fatal error', error);
    process.exit(1);
});