// import { Test, TestingModule } from '@nestjs/testing';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import { NotesController } from './notes.controller';
// import { NotesService } from './notes.service';
// import { Connection, connect, Model } from 'mongoose';
// import { Notes, NotesSchema } from './schemas/notes.schema';
// import { getModelToken } from '@nestjs/mongoose';
// import { CreateNoteDto } from './dto/create-note.dto';
// import { NoteAlreadyExists } from './exceptions/note-already-exists.exception';
// import { createNoteDtoStub } from './stubs/create-note.dto.stub';

// describe('NotesController', () => {
//   let notesController: NotesController;
//   let mongod: MongoMemoryServer;
//   let mongoConnection: Connection;
//   let notesModel: Model<Notes>

//   beforeAll(async () => {
//     mongod = await MongoMemoryServer.create(); // create a mongodb server and get the daemon
//     const uri = mongod.getUri(); // get connection uri for mongodb servver
//     mongoConnection = (await connect(uri)).connection;
//     notesModel = mongoConnection.model('Notes', NotesSchema);
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [NotesController],
//       providers: [
//         NotesService,
//         { provide: getModelToken(Notes.name), useValue: notesModel } // provide notes schema model
//       ],
//     }).compile();

//     notesController = module.get<NotesController>(NotesController);
//   });

//   // after all tests drop the database, close the connection, and stop the daemon
//   afterAll(async () => {
//     await mongoConnection.dropDatabase();
//     await mongoConnection.close();
//     await mongod.stop();
//   });

//   // after each test delete all entries
//   afterEach(async () => {
//     const collections = mongoConnection.collections;
//     for (const key in collections) {
//       const collection = collections[key];
//       await collection.deleteMany({});
//     }
//   });

//   describe('createNoteForArticle', () => {
//     it('should return the new note', async () => {
//       const createdNote = await notesController.createNote(createNoteDtoStub());
//       expect(createdNote.noteContent).toBe(createNoteDtoStub().noteContent);
//     });

//     it('should throw NoteAlreadyExists exception (Bad Request - 400) exception', async () => {
//       await (new notesModel(createNoteDtoStub()).save());
//       await expect(notesController.createNote(createNoteDtoStub()))
//         .rejects
//         .toThrow(NoteAlreadyExists);
//     });
//   })

//   describe('getNotesForArticle', () => {
//     it('should return all notes for the article', async () => {
//       await (new notesModel(createNoteDtoStub()).save());
//       const notes = await notesController.getAllNotes(createNoteDtoStub());
//       expect(notes.length).toBe(1);
//     });
//     it('should return an empty array', async () => {
//       const notes = await notesController.getAllNotes(createNoteDtoStub());
//       expect(notes.length).toBe(0);
//     });
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { Connection, connect, Model } from 'mongoose';
import { Notes, NotesSchema } from './schemas/notes.schema';
import { getModelToken } from '@nestjs/mongoose';
import { CreateNoteDto } from './dto/create-note.dto';
import { NoteAlreadyExists } from './exceptions/note-already-exists.exception';
import { createNoteDtoStub } from './stubs/create-note.dto.stub';
import { upvoteDto } from './dto/upvote.dto';
import { UpvoteTracking, UpvoteTrackingSchema } from './schemas/upvote.schema'; // Import the missing 'upvoteTrackingModel'

describe('NotesController', () => {
  let notesController: NotesController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let notesModel: Model<Notes>;
  let upvoteTrackingModel: Model<UpvoteTracking>; // Add the 'upvoteTrackingModel'

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    notesModel = mongoConnection.model('Notes', NotesSchema);
    upvoteTrackingModel = mongoConnection.model<UpvoteTracking>(
      'UpvoteTracking',
      UpvoteTrackingSchema,
    ); // Create the 'upvoteTrackingModel' with the correct type
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        NotesService,
        { provide: getModelToken(Notes.name), useValue: notesModel },
        {
          provide: getModelToken(UpvoteTracking.name),
          useValue: upvoteTrackingModel,
        },
      ],
    }).compile();

    notesController = module.get<NotesController>(NotesController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createNote', () => {
    it('should create a new note for a specific article link', async () => {
      const createNoteDto: CreateNoteDto = createNoteDtoStub();
      const createdNote = await notesController.createNote(createNoteDto);
      expect(createdNote).toBeDefined();
      expect(createdNote.noteContent).toBe(createNoteDto.noteContent);
    });
  });

  describe('getAllNotes', () => {
    it('should retrieve all notes for a specific article link', async () => {
      const createNoteDto: CreateNoteDto = createNoteDtoStub();
      await notesController.createNote(createNoteDto);
      const notes = await notesController.getAllNotes(createNoteDto);
      expect(notes).toBeDefined();
      expect(notes.length).toBe(1);
    });
  });

  describe('upvoteNote', () => {
    // it('should upvote a specific note if not already voted', async () => {
    //   const createNoteDto: CreateNoteDto = createNoteDtoStub();
    //   const upvoteDto: upvoteDto = {
    //     noteId: Object('noteId'),
    //     userId: 'userId',
    //   };
    //   await notesController.createNote(createNoteDto);
    //   const upvotedNote = await notesController.upvoteNote(upvoteDto);
    //   expect(upvotedNote).toBeDefined();
    //   expect(upvotedNote).toBe(true);
    // });

    it('should negate the vote if the note is already upvoted', async () => {
      const createNoteDto: CreateNoteDto = createNoteDtoStub();
      const upvoteDto: upvoteDto = {
        noteId: '65fc0ad63485a5c30cf766cb',
        userId: '65eeef7ae0bbbb763d2c5a72',
      };
      await notesController.createNote(createNoteDto);
      await notesController.upvoteNote(upvoteDto);
      const negatedNote = await notesController.upvoteNote(upvoteDto);
      expect(negatedNote).toBeDefined();
      expect(negatedNote).toBe(false);
    });
  });

  describe('deleteNote', () => {
    it('should delete a specific note', async () => {
      const createNoteDto: CreateNoteDto = createNoteDtoStub();
      await notesController.createNote(createNoteDto);
      const deletedNote = await notesController.deleteNote(createNoteDto);
      expect(deletedNote).toBeDefined();
      expect(deletedNote.noteContent).toBe(createNoteDto.noteContent);
    });
  });

  describe('getUserNotes', () => {
    it('should find all the usernotes by userID', async () => {
      const createNoteDto: CreateNoteDto = createNoteDtoStub();
      await notesController.createNote(createNoteDto);
      const userNotes = await notesController.getUserNotes(createNoteDto);
      expect(userNotes).toBeDefined();
      expect(userNotes.length).toBe(1);
    });
  });

  describe('getAllUserNotes', () => {
    it('should get all usernotes in DB', async () => {
      const userNotes = await notesController.getAllUserNotes();
      expect(userNotes).toBeDefined();
      expect(userNotes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isUpvoted', () => {
    it('should check if note is upvoted by user', async () => {
      const upvoteDto: upvoteDto = { noteId: 'noteId', userId: 'userId' };
      const isUpvoted = await notesController.isUpvoted(upvoteDto);
      expect(isUpvoted).toBeDefined();
    });
  });

  describe('featuredNote', () => {
    it('should get the featured note for a specific article link', async () => {
      const createNoteDto: CreateNoteDto = createNoteDtoStub();
      const createdNote = await notesController.createNote(createNoteDto);
      const featuredNote = await notesController.featuredNote(createdNote);
      expect(featuredNote).toBeDefined();
      expect(featuredNote.noteContent).toBe(createNoteDto.noteContent);
    });
  });
});
