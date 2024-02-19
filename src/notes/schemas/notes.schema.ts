import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema({
    timestamps: true
})

export class Notes {

    @Prop()
    articleLink: string;

    @Prop()
    userId: string;

    @Prop()
    username: string;

    @Prop()
    noteContent: string;

    @Prop()
    upvote: number;
}

export const NotesSchema = SchemaFactory.createForClass(Notes);