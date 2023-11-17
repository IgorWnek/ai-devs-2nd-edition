import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import { SolveHelloApiTask, solveHelloApiTaskUseCase } from './application/use-case/solve-hello-api-task-use-case.js';
import {
  SolveModerationTaskUseCase,
  solveModerationTaskUseCase,
} from './application/use-case/solve-moderation-task-use-case.js';
import { TaskResultDTO } from './application/dto/task-result-dto.js';
import {
  solveBloggerTaskUseCase,
  SolveBloggerTaskUseCase,
} from './application/use-case/solve-blogger-task-use-case.js';

async function main() {
  console.log(chalk.yellow(figlet.textSync('AI_Devs #2 CLI', { horizontalLayout: 'full' })));

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
        {
          name: 'Solve Moderation task',
          value: SolveModerationTaskUseCase.TASK_NAME,
        },
        {
          name: 'Solve Blogger task',
          value: SolveBloggerTaskUseCase.TASK_NAME,
        },
        { name: 'Quit', value: 'quit' },
      ],
    },
  ]);

  return response.action;
}

async function performAction(action: string): Promise<void> {
  let taskResultDTO: null | TaskResultDTO = null;

  switch (action) {
    case SolveHelloApiTask.TASK_NAME:
      taskResultDTO = await solveHelloApiTaskUseCase.execute();
      break;
    case SolveModerationTaskUseCase.TASK_NAME:
      taskResultDTO = await solveModerationTaskUseCase.execute();
      break;
    case SolveBloggerTaskUseCase.TASK_NAME:
      taskResultDTO = await solveBloggerTaskUseCase.execute();
      break;
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
