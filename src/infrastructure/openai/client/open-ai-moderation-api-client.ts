import { ModerationApiClient } from "../../../application/client/moderation-api-client.js";
import { ModerationResultDTO } from "../../../application/dto/moderation-result-dto.js";
import openAiConfig, { OpenAiConfig } from "../../../config/open-ai/open-ai-config.js";
import axios from "axios";
import {ModerationsEndpointResponseDTO} from "../dto/moderations-endpoint-response-dto.js";

interface OpenAiModerationApiClientDependencies {
    openAiConfig: OpenAiConfig;
}

interface SimpleModerationApiResponse {
    id: string;
    model: string;
    results: []
}

export class OpenAiModerationApiClient implements ModerationApiClient {
    private static MODERATION_ENDPOINT = 'https://api.openai.com/v1/moderations';

    public constructor(private dependencies: OpenAiModerationApiClientDependencies) {}

    public async moderateContent(contents: string[]): Promise<ModerationResultDTO[]> {
        const { apiKey } = this.dependencies.openAiConfig;
        const moderationApiResponse = await axios.post<ModerationsEndpointResponseDTO>(
            OpenAiModerationApiClient.MODERATION_ENDPOINT,
            {
                input: contents,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                }
            }
        );

        return moderationApiResponse.data.results.map(result => new ModerationResultDTO({
            flagged: result.flagged,
        }));
    }
}

export const openAiModerationApiClient: ModerationApiClient = new OpenAiModerationApiClient({
    openAiConfig: openAiConfig,
});
