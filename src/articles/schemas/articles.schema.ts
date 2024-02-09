import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: true
})

export class Articles {

    @Prop()
    title: string;

    @Prop()
    link: string;

    @Prop()
    content: string;

    @Prop()
    datePublished: string;

    @Prop()
    prediction: number;
}

export const ArticlesSchema = SchemaFactory.createForClass(Articles);