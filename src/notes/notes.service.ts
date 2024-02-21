import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateNoteDto } from './dto/create-note.dto';
import { Notes } from './schemas/notes.schema';
import mongoose from 'mongoose';
import { NoteAlreadyExists } from './exceptions/note-already-exists.exception';


@Injectable()
export class NotesService {
    /* 
    POST Method to create a new note for a specific article link
    GET Method to retrieve all notes for a specific article link
    PUT Method to upvote a specific note
    DELETE Method to delete a specific note
     */

    constructor(
        @InjectModel(Notes.name)
        private noteModel: mongoose.Model<Notes>,
    ) {}

    // POST Method to create a new note for a specific article link
    async createNoteForArticle(note: CreateNoteDto): Promise<any> {
        
        if (!this.noteModel) {
            throw new Error('MongoDB not connected');
        }
        const existingNote = await this.noteModel.findOne({ noteContent: note.noteContent });
        if (existingNote) throw new NoteAlreadyExists();
        const response = await this.noteModel.create(note);

        if (!response) {
            console.log('Note not created');
        }

        return response;
    }

    // GET Method to retrieve all notes for a specific article link
    async getAllNotesForArticle(note: CreateNoteDto): Promise<Notes[]> {

        if (!this.noteModel) {
            throw new Error('MongoDB not connected');
        }

        // Find all notes for a specific article link
        const response = await this.noteModel.find({ articleLink: note.articleLink });

        if (!response) {
            console.log('Note not found');
        }

        return response;
    }

    // PUT Method to upvote a specific note
    async upvoteNoteForArticle(note: CreateNoteDto): Promise<Notes> {

        if (!this.noteModel) {
            throw new Error('MongoDB not connected');
        }

        // Find the note by ID and update the upvote count
        const response = await this.noteModel.findOneAndUpdate({ _id: note._id }, { upvote: note.upvote + 1 }, { new: true, runValidators: true });

        if (!response) {
            console.log('Note not upvoted');
        }

        return response;
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
}
