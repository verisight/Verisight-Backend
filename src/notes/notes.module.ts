import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesSchema } from './schemas/notes.schema';
import { UpvoteTrackingSchema } from './schemas/upvote.schema';
import { Model } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notes', schema: NotesSchema },
      { name: 'UpvoteTracking', schema: UpvoteTrackingSchema },
    ]),
  ],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
