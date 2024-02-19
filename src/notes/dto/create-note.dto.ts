export class CreateNoteDto {
    _id: string;
    articleLink: string;
    userId: string;
    username: string;
    date: string;
    noteContent: string;
    upvote: number;
}