const { MongoClient } = require("mongodb");
const mongoURL = "mongodb://127.0.0.1:27017";
const dbName = "quirknotes";
let db;
let client;

beforeAll(async () => {
    client = new MongoClient(mongoURL);
    try {
      await client.connect();
      db = client.db(dbName);
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
});

afterEach(async () => {
    await db.dropDatabase();
});

afterAll(async () => {
    await client.close();
});

// Collections to manage
const COLLECTIONS = {
    notes: "notes",
};

test("1+2=3, empty array is empty", () => {
    expect(1 + 2).toBe(3);
    expect([].length).toBe(0);
  });

const SERVER_URL = "http://localhost:4000";

test("/postNote - Post a note", async () => {
    const title = "NoteTitleTest";
    const content = "NoteTitleContent";

    const postNoteRes = await fetch(`${SERVER_URL}/postNote`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        title: title,
        content: content,
        }),
    });

    const postNoteBody = await postNoteRes.json();

    expect(postNoteRes.status).toBe(200);
    expect(postNoteBody.response).toBe("Note added succesfully.");
});

test("/getAllNotes - Return list of zero notes for getAllNotes", async () => {
    const getAllNotesRes = await fetch(`${SERVER_URL}/getAllNotes`);
    const getAllNotesBody = await getAllNotesRes.json();
    expect(getAllNotesRes.status).toBe(200);
    expect(getAllNotesBody.response.length).toBe(0);
});

test("/getAllNotes - Return list of two notes for getAllNotes", async () => {
    let createdAt = new Date();
    const collection = db.collection(COLLECTIONS.notes);
    
    await collection.insertOne({
        title: "note 1",
        content: "note 1 content",
        createdAt
    });
    
    createdAt = new Date()
    await collection.insertOne({
        title: "note 2",
        content: "note 2 content",
        createdAt
    });

    const getAllNotesRes = await fetch(`${SERVER_URL}/getAllNotes`);
    const getAllNotesBody = await getAllNotesRes.json();
    expect(getAllNotesRes.status).toBe(200);
    expect(getAllNotesBody.response.length).toBe(2);
});

test("/deleteNote - Delete a note", async () => {
    const createdAt = new Date()
    const insertedNote = await db.collection(COLLECTIONS.notes).insertOne({ title: 'Delete note', content: 'Delete note content', createdAt });
    const noteId = insertedNote.insertedId;
    const deleteNoteRes = await fetch(`${SERVER_URL}/deleteNote/${noteId}`, { method: 'DELETE' });
    
    expect(deleteNoteRes.status).toBe(200);
    const deleteNoteBody = await deleteNoteRes.json()
    expect(deleteNoteBody.response).toBe(`Document with ID ${noteId} deleted.`);

    // Verify the note is deleted
    const deletedNote = await db.collection(COLLECTIONS.notes).findOne({ _id: noteId });
    expect(deletedNote).toBeNull();
});

test("/patchNote - Patch with content and title", async () => {
    // Insert a note into the database.
    const noteToPatch = {
        title: "Original Title",
        content: "Original Content",
        createdAt: new Date()
    };
    const insertedNote = await db.collection(COLLECTIONS.notes).insertOne(noteToPatch);
    const noteId = insertedNote.insertedId;

    const updatedTitle = "Updated Title";
    const updatedContent = "Updated Content";

    // Make a PATCH request to the /patchNote endpoint with the new title and content.
    const patchNoteRes = await fetch(`${SERVER_URL}/patchNote/${noteId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: updatedTitle,
            content: updatedContent
        }),
    });
    const patchNoteBody = await patchNoteRes.json();
    expect(patchNoteBody.response).toBe(`Document with ID ${noteId} patched.`);
    // Verify the HTTP response status code.
    expect(patchNoteRes.status).toBe(200);
    // Verify the note has been updated in the database.
    const updatedNote = await db.collection(COLLECTIONS.notes).findOne({ _id: noteId });
    expect(updatedNote.title).toBe(updatedTitle);
    expect(updatedNote.content).toBe(updatedContent);
});

test("/patchNote - Patch with just title", async () => {
    // Insert a note into the database.
    const noteToPatch = {
        title: "Original Title",
        content: "Original Content",
        createdAt: new Date()
    };
    const insertedNote = await db.collection(COLLECTIONS.notes).insertOne(noteToPatch);
    const noteId = insertedNote.insertedId;

    const updatedTitle = "Updated Title";

    // Make a PATCH request to the /patchNote endpoint with the new title and content.
    const patchNoteRes = await fetch(`${SERVER_URL}/patchNote/${noteId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: updatedTitle,
        }),
    });
    const patchNoteBody = await patchNoteRes.json();
    expect(patchNoteBody.response).toBe(`Document with ID ${noteId} patched.`);
    // Verify the HTTP response status code.
    expect(patchNoteRes.status).toBe(200);
    // Verify the note has been updated in the database.
    const updatedNote = await db.collection(COLLECTIONS.notes).findOne({ _id: noteId });
    expect(updatedNote.title).toBe(updatedTitle);
});

test("/patchNote - Patch with just content", async () => {
    // Insert a note into the database.
    const noteToPatch = {
        title: "Original Title",
        content: "Original Content",
        createdAt: new Date()
    };
    const insertedNote = await db.collection(COLLECTIONS.notes).insertOne(noteToPatch);
    const noteId = insertedNote.insertedId;

    const updatedContent = "Updated Content";

    // Make a PATCH request to the /patchNote endpoint with the new title and content.
    const patchNoteRes = await fetch(`${SERVER_URL}/patchNote/${noteId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: updatedContent
        }),
    });
    const patchNoteBody = await patchNoteRes.json();
    expect(patchNoteBody.response).toBe(`Document with ID ${noteId} patched.`);
    // Verify the HTTP response status code.
    expect(patchNoteRes.status).toBe(200);
    // Verify the note has been updated in the database.
    const updatedNote = await db.collection(COLLECTIONS.notes).findOne({ _id: noteId });
    expect(updatedNote.content).toBe(updatedContent);
});

test("/deleteAllNotes - Delete one note", async () => {
    // Insert a note into the database.
    const noteToDelete = {
        title: "Original Title",
        content: "Original Content",
        createdAt: new Date()
    };
    await db.collection(COLLECTIONS.notes).insertOne(noteToDelete);
    // Make a DELETE request to the /deleteAllNotes endpoint.
    const deleteAllNotesRes = await fetch(`${SERVER_URL}/deleteAllNotes`, { method: 'DELETE' });
    
    // Verify the HTTP response status code.
    expect(deleteAllNotesRes.status).toBe(200);

    // Verify the database is empty.
    const notesCount = await db.collection(COLLECTIONS.notes).countDocuments();
    expect(notesCount).toBe(0);
    const deleteAllNotesBody = await deleteAllNotesRes.json();
    expect(deleteAllNotesBody.response).toBe(`1 note(s) deleted.`);
});

test("/deleteAllNotes - Delete three notes", async () => {
    // Insert three notes into the database.
    await db.collection(COLLECTIONS.notes).insertMany([
        { title: "Note 1", content: "Content 1", createdAt: new Date() },
        { title: "Note 2", content: "Content 2", createdAt: new Date() },
        { title: "Note 3", content: "Content 3", createdAt: new Date() }
    ]);

    // Make a DELETE request to the /deleteAllNotes endpoint.
    const deleteAllNotesRes = await fetch(`${SERVER_URL}/deleteAllNotes`, { method: 'DELETE' });
    
    // Verify the HTTP response status code.
    expect(deleteAllNotesRes.status).toBe(200);

    // Verify the database is empty.
    const notesCount = await db.collection(COLLECTIONS.notes).countDocuments();
    expect(notesCount).toBe(0);
    const deleteAllNotesBody = await deleteAllNotesRes.json();
    expect(deleteAllNotesBody.response).toBe(`3 note(s) deleted.`);
});

test("/updateNoteColor - Update color of a note to red (#FF0000)", async () => {
    // Insert a note into the database.
    const noteToPatch = {
        title: "Original Title",
        content: "Original Content",
        createdAt: new Date()
    };
    const insertedNote = await db.collection(COLLECTIONS.notes).insertOne(noteToPatch);
    const noteId = insertedNote.insertedId;

    const updatedTitle = "Updated Title";
    const updatedContent = "Updated Content";

    // Make a PATCH request to the /updateNoteColor endpoint with the new color.
    const updateNoteColorRes = await fetch(`${SERVER_URL}/updateNoteColor/${noteId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            color: "#FF0000"
        }),
    });

    // Verify the HTTP response status code.
    expect(updateNoteColorRes.status).toBe(200);

    // Verify the note's color has been updated in the database.
    const updatedNote = await db.collection(COLLECTIONS.notes).findOne({ _id: noteId });
    expect(updatedNote.color).toBe("#FF0000");
    const patchNoteBody = await updateNoteColorRes.json();
    expect(patchNoteBody.message).toBe('Note color updated successfully.');
});