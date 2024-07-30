# note_keep

## Overview

This Note-Taking App is a simple and intuitive application designed for quick and efficient note-taking. Inspired by Google Keep, this app allows users to create, edit, and manage their notes with ease. The application is built using HTML, CSS, JavaScript for the front end, and Node.js with Express and MariaDB for the back end.

## Features

- Create new notes with ease.
- Edit existing notes.
- Move notes to the top of the list.
- Delete notes that are no longer needed.
- Search through notes.
- View notes with timestamps.

## Technologies Used

- **Front End:** HTML, CSS, JavaScript
- **Back End:** Node.js, Express
- **Database:** MariaDB
- **Other Dependencies:** body-parser, cors, dotenv, mysql2

## Getting Started

### Prerequisites

- Node.js (v18.19.0 or later)
- MariaDB (with a database configured)
- Git

### Installation

1. **Clone the Repository:**

   git clone https://github.com/AaronOoooo/keepnote.git
   cd keepnote

2. Install Dependencies:

    npm install
    
3. Set Up Environment Variables:

    Create a .env file in the root directory of the project and populate it with your MariaDB credentials and server details.

    DB_HOST=192.168.50.214
    DB_USER=pi
    DB_PASSWORD=<Your_MariaDB_Password>
    DB_NAME=notes_app
    HOST=192.168.50.214
    PORT=9200

4. Start MariaDB Server:

    Make sure your MariaDB server is running and accessible.

    sudo systemctl start mariadb

5. Run the Application:

    node server.js
    The server will start on the specified host and port (e.g., http://192.168.50.214:9200).

Usage
1. Access the App:

    Open your browser and navigate to the server URL (e.g., http://192.168.50.214:9200).

2. Create a Note:

    Enter your note in the provided text area.
    Click the "Save Note" button.

3. Edit a Note:

    Click the "Edit" button next to the note you want to edit.
    Modify the note text and save changes.

4. Move a Note to the Top:

    Click the "Move to Top" button next to the note you want to prioritize.

5. Delete a Note:

    Click the "Delete" button next to the note you want to remove.

6. Search Notes:

    Use the search bar to find notes containing specific text.

Contributing
Contributions are welcome! If you'd like to contribute, please fork the repository and create a pull request with your changes.

License
This project is licensed under the ISC License. See the LICENSE file for details.

Acknowledgements
Special thanks to the contributors and the open-source community for their invaluable support and resources.