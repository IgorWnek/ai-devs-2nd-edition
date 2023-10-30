interface ModerationResultDTOPayload {
    flagged: boolean;
}

export class ModerationResultDTO {
    public flagged: boolean;

    public constructor(payload: ModerationResultDTOPayload) {
        this.flagged = payload.flagged;
    }
}
