document.getElementById('saveNoteButton').addEventListener('click', saveNote);
document.getElementById('showMoreButton').addEventListener('click', showMore);
document.getElementById('searchInput').addEventListener('input', searchNotes);

let notesCount = 15;

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
    notesCount = 15; // Reset to show the first 15 notes
    loadNotes();
  }
}

async function loadNotes() {
  const searchInput = document.getElementById('searchInput');
  const searchQuery = searchInput.value.trim();
  const response = await fetch(`/api/notes?search=${searchQuery}&offset=0&limit=${notesCount}`);

  if (response.ok) {
    const notes = await response.json();
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';

    notes.forEach((note) => {
      const noteItem = document.createElement('li');
      noteItem.innerHTML = `
        <div class="noteText">${note.text.length > 300 ? note.text.slice(0, 300) + '<b>...</b>' : note.text}</div>
        <div class="noteDate">${formatDate(note.date)}</div>
        <div class="buttons">
          <button class="editButton" onclick="editNote(${note.id})">Edit</button>
          <button class="moveToTopButton" onclick="moveToTop(${note.id})">Move to Top</button>
          ${note.text.length > 300 ? `<button class="showButton" onclick="toggleText(${note.id}, this)">Show All</button>` : ''}
          <div class="deleteButtonContainer">
            <button class="deleteButton" onclick="deleteNote(${note.id})">Delete</button>
          </div>
        </div>
      `;
      notesList.appendChild(noteItem);
    });

    updateEntryCount(notes.length, await getTotalEntriesCount());
  }
}

function updateEntryCount(displayedCount, totalCount) {
  const entryCount = document.getElementById('entryCount');
  entryCount.textContent = `Entries: ${displayedCount} / ${totalCount}`;
}

async function getTotalEntriesCount() {
  const response = await fetch(`/api/notes/count`);
  if (response.ok) {
    const result = await response.json();
    return result.count;
  }
  return 0;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  return date.toLocaleString('en-US', options).replace(',', '');
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

async function deleteNote(id) {
  if (confirm('Are you sure you want to delete this note?')) {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadNotes();
    }
  }
}

async function showMore() {
  notesCount += 10;
  await loadMoreNotes();
}

async function loadMoreNotes() {
  const searchInput = document.getElementById('searchInput');
  const searchQuery = searchInput.value.trim();
  const response = await fetch(`/api/notes?search=${searchQuery}&offset=${notesCount - 10}&limit=10`);

  if (response.ok) {
    const notes = await response.json();
    const notesList = document.getElementById('notesList');

    notes.forEach((note) => {
      const noteItem = document.createElement('li');
      const noteText = note.text.length > 300 ? `${note.text.slice(0, 300)}<b>...</b>` : note.text;
      const showButton = note.text.length > 300 ? `<button class="showButton" onclick="toggleText(${note.id}, this)">Show All</button>` : '';

      noteItem.innerHTML = `
        <div class="noteText" data-full-text="${note.text}">${noteText}</div>
        <div class="noteDate">${formatDate(note.date)}</div>
        <div class="buttons">
          <button class="editButton" onclick="editNote(${note.id})">Edit</button>
          <button class="moveToTopButton" onclick="moveToTop(${note.id})">Move to Top</button>
          ${showButton}
          <div class="deleteButtonContainer">
            <button class="deleteButton" onclick="deleteNote(${note.id})">Delete</button>
          </div>
        </div>
      `;
      notesList.appendChild(noteItem);
    });

    updateEntryCount(notesList.children.length, await getTotalEntriesCount());
  }
}

async function searchNotes() {
  notesCount = 15; // Reset the note count when searching
  await loadNotes();
}

function toggleText(id, button) {
  const noteTextElement = button.parentElement.parentElement.querySelector('.noteText');
  const fullText = noteTextElement.getAttribute('data-full-text');

  if (button.innerText === 'Show All') {
    noteTextElement.innerHTML = fullText;
    button.innerText = 'Show Less';
  } else {
    noteTextElement.innerHTML = `${fullText.slice(0, 300)}<b>...</b>`;
    button.innerText = 'Show All';
  }
}

// Initial load
document.addEventListener('DOMContentLoaded', loadNotes);
