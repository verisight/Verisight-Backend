import { HttpException } from "@nestjs/common";

export class NoteAlreadyExists extends HttpException {
    constructor() {
        super("Note already exists", 400);
    }
}