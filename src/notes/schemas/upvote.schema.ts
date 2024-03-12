import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class UpvoteTracking {
  @Prop()
  noteId: string;

  @Prop()
  userId: string;
}

export const UpvoteTrackingSchema =
  SchemaFactory.createForClass(UpvoteTracking);
