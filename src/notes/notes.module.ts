import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesSchema } from './schemas/notes.schema';

@Module({
  imports : [MongooseModule.forFeature([{ name: 'Notes', schema: NotesSchema }])],
  controllers: [NotesController],
  providers: [NotesService]
})
export class NotesModule {}
