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

describe('NotesController', () => {
  let notesController: NotesController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let notesModel: Model<Notes>

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create(); // create a mongodb server and get the daemon
    const uri = mongod.getUri(); // get connection uri for mongodb servver
    mongoConnection = (await connect(uri)).connection;
    notesModel = mongoConnection.model('Notes', NotesSchema);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        NotesService,
        { provide: getModelToken(Notes.name), useValue: notesModel } // provide notes schema model
      ],
    }).compile();

    notesController = module.get<NotesController>(NotesController);
  });

  // after all tests drop the database, close the connection, and stop the daemon
  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  // after each test delete all entries
  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createNoteForArticle', () => {
    it('should return the new note', async () => {
      const createdNote = await notesController.createNote(createNoteDtoStub());
      expect(createdNote.noteContent).toBe(createNoteDtoStub().noteContent);
    });

    it('should throw NoteAlreadyExists exception (Bad Request - 400) exception', async () => {
      await (new notesModel(createNoteDtoStub()).save());
      await expect(notesController.createNote(createNoteDtoStub()))
        .rejects
        .toThrow(NoteAlreadyExists);
    });
  })

  describe('getNotesForArticle', () => {
    it('should return all notes for the article', async () => {
      await (new notesModel(createNoteDtoStub()).save());
      const notes = await notesController.getAllNotes(createNoteDtoStub());
      expect(notes.length).toBe(1);
    });
    it('should return an empty array', async () => {
      const notes = await notesController.getAllNotes(createNoteDtoStub());
      expect(notes.length).toBe(0);
    });
  });
});
