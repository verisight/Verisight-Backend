import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateNoteDto } from './dto/create-note.dto';
import { upvoteDto } from './dto/upvote.dto';
import { Notes } from './schemas/notes.schema';
import { UpvoteTracking } from './schemas/upvote.schema';
import mongoose from 'mongoose';
import { NoteAlreadyExists } from './exceptions/note-already-exists.exception';

@Injectable()
export class NotesService {
  /* 
    POST Method to create a new note for a specific article link
    GET Method to retrieve all notes for a specific article link
    PUT Method to upvote a specific note if not already voted. If voted then negate the vote
    DELETE Method to delete a specific note
    Find all the usernotes by userID
     */

  constructor(
    @InjectModel(Notes.name)
    private noteModel: mongoose.Model<Notes>,

    @InjectModel(UpvoteTracking.name)
    private upvoteModel: mongoose.Model<UpvoteTracking>,
  ) {}

  // POST Method to create a new note for a specific article link
  async createNoteForArticle(note: CreateNoteDto): Promise<any> {
    if (!this.noteModel) {
      throw new Error('MongoDB not connected');
    }
    const existingNote = await this.noteModel.findOne({
      noteContent: note.noteContent,
      articleLink: note.articleLink,
    });
    if (existingNote) throw new NoteAlreadyExists();
    const response = await this.noteModel.create(note);

    if (!response) {
      console.log('Note not created');
    }

    return response;
  }

  // GET Method to retrieve all notes for a specific article link
  async getAllNotesForArticle(note: CreateNoteDto): Promise<Notes[]> {
    if (!this.noteModel || !this.upvoteModel) {
      throw new Error('MongoDB not connected');
    }

    // Find all notes for a specific article link
    let response = await this.noteModel.find({
      articleLink: note.articleLink,
    });

    if (!response) {
      console.log('Note not found');
    }

    response = response.sort((a, b) => b.upvote - a.upvote);

    return response;
  }

  // PUT Method to upvote a specific note if not already voted. If voted then negate the vote
  async upvoteNoteForArticle(note: upvoteDto): Promise<any> {
    if (!this.noteModel || !this.upvoteModel) {
      throw new Error('MongoDB not connected');
    }

    const existingUpvote = await this.upvoteModel.findOne({
      noteId: note.noteId,
      userId: note.userId,
    });
    if (existingUpvote) {
      const response = await this.noteModel.findOneAndUpdate(
        { _id: note.noteId },
        { $inc: { upvote: -1 } },
      );
      await this.upvoteModel.findOneAndDelete({
        noteId: note.noteId,
        userId: note.userId,
      });
      if (!response) {
        console.log(response);
      }
      return false;
    } else {
      const response = await this.noteModel.findOneAndUpdate(
        { _id: note.noteId },
        { $inc: { upvote: 1 } },
      );
      await this.upvoteModel.create({
        noteId: note.noteId,
        userId: note.userId,
      });
      if (!response) {
        console.log(response);
      }
      return true;
    }
  }

  // DELETE Method to delete a specific note
  async deleteNoteForArticle(note: CreateNoteDto): Promise<Notes> {
    if (!this.noteModel) {
      throw new Error('MongoDB not connected');
    }

    // Find the note by ID and delete it
    const response = await this.noteModel.findOneAndDelete({ _id: note._id });
    const response1 = await this.upvoteModel.deleteMany({ noteId: note._id });

    if (!response || !response1) {
      console.log('Note not found');
    }

    return response;
  }

  // Find all the usernotes by userID
  async getUserNotes(note: CreateNoteDto): Promise<Notes[]> {
    if (!this.noteModel) {
      throw new Error('MongoDB not connected');
    }

    // Find all the notes by userID
    const response = await this.noteModel.find({ userId: note.userId });

    if (!response) {
      console.log('Note not found');
    }

    return response;
  }

  //Get all usernotes in DB
  async getAllUserNotes(): Promise<Notes[]> {
    if (!this.noteModel) {
      throw new Error('MongoDB not connected');
    }

    // Find all the notes by userID
    const response = await this.noteModel.find({});

    if (!response) {
      console.log('Note not found');
    }

    return response;
  }

  // Get if note is upvoted by user
  async isNoteUpvotedByUser(note: upvoteDto): Promise<boolean> {
    if (!this.upvoteModel) {
      throw new Error('MongoDB not connected');
    }

    // Find the note by userID
    const response = await this.upvoteModel.findOne({
      noteId: note.noteId,
      userId: note.userId,
    });

    if (!response) {
      return false;
    }

    return true;
  }

  // Get most upvoted note
  async getFeaturedNoteForArticle(note: CreateNoteDto): Promise<Notes> {
    if (!this.noteModel) {
      throw new Error('MongoDB not connected');
    }

    // Find the note by userID
    const response = await this.noteModel.find({
      articleLink: note.articleLink,
    });

    if (!response) {
      console.log(response);
    }

    if (response.length === 0) {
      return null;
    } else if (response.length === 1) {
      return response[0];
    } else {
      response.sort((a, b) => b.upvote - a.upvote);
      return response[0];
    }
  }
}
