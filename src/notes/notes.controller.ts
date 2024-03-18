import { Body, Controller, Post } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { Notes } from './schemas/notes.schema';
import { upvoteDto } from './dto/upvote.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('notes')
export class NotesController {
  /* 
    POST Method to create a new note for a specific article link
    GET Method to retrieve all notes for a specific article link
    PUT Method to upvote a specific note if not already voted. If voted then negate the vote
    DELETE Method to delete a specific note
    Find the usernote by userID
     */

  constructor(private noteService: NotesService) {}

  // POST Method to create a new note for a specific article link
  @Post()
  async createNote(
    @Body()
    note: CreateNoteDto,
  ): Promise<any> {
    //use await after testing
    return this.noteService.createNoteForArticle(note);
  }

  // GET Method to retrieve all notes for a specific article link
  @Post('all')
  async getAllNotes(
    @Body()
    note: CreateNoteDto,
  ): Promise<Notes[]> {
    return this.noteService.getAllNotesForArticle(note);
  }

  // PUT Method to upvote a specific note if not already voted. If voted then negate the vote
  @Post('upvote')
  async upvoteNote(
    @Body()
    note: CreateNoteDto,
  ): Promise<Notes> {
    return this.noteService.upvoteNoteForArticle(note);
  }

  // DELETE Method to delete a specific note
  @Post('delete')
  async deleteNote(
    @Body()
    note: CreateNoteDto,
  ): Promise<Notes> {
    return this.noteService.deleteNoteForArticle(note);
  }

  // Find the usernote by userID
  @Post('findUserNote')
  async findUserNote(
    @Body()
    note: CreateNoteDto,
  ): Promise<Notes> {
    return this.noteService.findUserNoteByUserID(note);
  }

  // Get if note is upvoted by user
  @SkipThrottle()
  @Post('isUpvoted')
  async isUpvoted(
    @Body()
    note: upvoteDto,
  ): Promise<any> {
    return this.noteService.isNoteUpvotedByUser(note);
  }

  @Post('featuredNote')
  async featuredNote(
    @Body()
    note: CreateNoteDto,
  ): Promise<Notes> {
    return this.noteService.getFeaturedNoteForArticle(note);
  }
}
