import { ModerationResultDTO } from '../dto/moderation-result-dto.js';

export interface ModerationApiClient {
  moderateContent(contents: string[]): Promise<ModerationResultDTO[]>;
}
