document.getElementById('saveNoteButton').addEventListener('click', saveNote);
document.getElementById('showMoreButton').addEventListener('click', showMore);
document.getElementById('searchInput').addEventListener('input', loadNotes);

let notesCount = 10;

async function saveNote() {
  const noteInput = document.getElementById('noteInput');
  const noteText = noteInput.value.trim();
  
  if (!noteText) return;

  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: noteText })
  });

  if (response.ok) {
    noteInput.value = '';
    loadNotes();
  }
}

async function loadNotes() {
  const searchInput = document.getElementById('searchInput');
  const searchQuery = searchInput.value.trim();
  const response = await fetch(`/api/notes?search=${searchQuery}&offset=${notesCount - 10}`);

  if (response.ok) {
    const notes = await response.json();
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';

    notes.forEach((note) => {
      const noteItem = document.createElement('li');
      noteItem.innerHTML = `
        <div class="noteText">${note.text}</div>
        <div class="noteDate">${formatDate(note.date)}</div>
        <button class="editButton" onclick="editNote(${note.id})">Edit</button>
        <button class="moveToTopButton" onclick="moveToTop(${note.id})">Move to Top</button>`;
notesList.appendChild(noteItem);

    });
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}-${date.getFullYear()}, ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
}

async function editNote(id) {
  const noteText = prompt('Edit your note:');
  if (noteText === null) return;

  const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: noteText })
  });

  if (response.ok) {
    loadNotes();
  }
}

async function moveToTop(id) {
  const response = await fetch(`/api/notes/${id}/move-to-top`, {
    method: 'PUT'
  });

  if (response.ok) {
    loadNotes();
  }
}

async function showMore() {
  notesCount += 10;
  loadNotes();
}

loadNotes();
