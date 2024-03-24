import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { Notes } from './schemas/notes.schema';
import { upvoteDto } from './dto/upvote.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';

@SkipThrottle()
@Controller('notes')
export class NotesController {
  /* 
    POST Method to create a new note for a specific article link
    GET Method to retrieve all notes for a specific article link
    PUT Method to upvote a specific note if not already voted. If voted then negate the vote
    DELETE Method to delete a specific note
    Find all the usernotes by userID
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
  async getAllNotes(@Body() note: CreateNoteDto): Promise<any> {
    const notes = await this.noteService.getAllNotesForArticle(note);
    return notes;
  }

  // PUT Method to upvote a specific note if not already voted. If voted then negate the vote
  @Post('upvote')
  async upvoteNote(
    @Body()
    note: upvoteDto,
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

  // Find all the usernotes by userID
  @Post('userNotesbyId')
  async getUserNotes(
    @Body()
    note: CreateNoteDto,
  ): Promise<Notes[]> {
    return this.noteService.getUserNotes(note);
  }

  //Get all usernotes in DB
  @Get('all')
  async getAllUserNotes(): Promise<Notes[]> {
    return this.noteService.getAllUserNotes();
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
