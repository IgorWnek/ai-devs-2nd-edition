import { ModerationObjectDTO } from "./moderation-object-dto.js";

export interface ModerationsEndpointResponseDTO {
    id: string;
    model: string;
    results: ModerationObjectDTO[];
}
