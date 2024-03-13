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
  async upvoteNoteForArticle(note: CreateNoteDto): Promise<any> {
    if (!this.noteModel || !this.upvoteModel) {
      throw new Error('MongoDB not connected');
    }

    //Before allowing a user to upvote a user note, check if there's already an entry in the upvote table for the current user and the note they are trying to upvote.
    //If there's no existing upvote entry, allow the user to upvote the user note. When processing the upvote, insert a new record into the upvote table with the user's ID and the note's ID.

    const existingUpvote = await this.upvoteModel.findOne({
      noteId: note._id,
      userId: note.userId,
    });
    if (existingUpvote) {
      const response = await this.noteModel.findOneAndUpdate(
        { _id: note._id },
        { $inc: { upvote: -1 } },
      );
      await this.upvoteModel.findOneAndDelete({
        noteId: note._id,
        userId: note.userId,
      });
      if (!response) {
        console.log('Note not upvoted');
      }
      return false;
    } else {
      const response = await this.noteModel.findOneAndUpdate(
        { _id: note._id },
        { $inc: { upvote: 1 } },
      );
      await this.upvoteModel.create({ noteId: note._id, userId: note.userId });
      if (!response) {
        console.log('Note not upvoted');
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

    if (!response) {
      console.log('Note not deleted');
    }

    return response;
  }

  // Find the usernote by userID
  async findUserNoteByUserID(note: CreateNoteDto): Promise<Notes> {
    if (!this.noteModel) {
      throw new Error('MongoDB not connected');
    }

    // Find the note by userID
    const response = await this.noteModel.findOne({ userId: note.userId });

    if (!response) {
      console.log('User ID not found');
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

    response.sort((a, b) => b.upvote - a.upvote);
    return response[0];
  }
}
