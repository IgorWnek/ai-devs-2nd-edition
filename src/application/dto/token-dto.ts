interface TokenDTOPayload {
    value: string;
}

export class TokenDTO {
    public value: string;

    public constructor(public payload: TokenDTOPayload) {
        this.value = payload.value;
    }
}
