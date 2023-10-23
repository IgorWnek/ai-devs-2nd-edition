export interface SolveTaskUseCase<T> {
    execute(): Promise<T>;
}
