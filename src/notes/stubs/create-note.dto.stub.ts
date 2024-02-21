import { CreateNoteDto } from "../dto/create-note.dto";

export const createNoteDtoStub = (): CreateNoteDto => {
    return {
        _id: "5f7c9b2b1f7e4c001c8d1f3b",
        articleLink: "https://www.google.com",
        userId: "5f7c9b2b1f7e4c001c8d1f3b",
        username: "test",
        date: "2020-10-06T13:00:00.000Z",
        noteContent: "This is a test note",
        upvote: 0,
    };
};
