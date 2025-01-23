MapSimulator
============

MapSimulator is a real-time collaborative whiteboard/map tool built with:

-   **React + Fabric.js** (frontend)
-   **Node + Socket.IO** (backend)
-   **JSON File Persistence** (optional)

Project Structure
-----------------

```
MapSimulator/
  ├── backend/
  │    ├── server.js
  │    └── ...
  ├── frontend/
  │    ├── package.json
  │    └── ...
  ├── package.json
  └── README.md`
  ```

-   **frontend/** contains the React application (Fabric.js, Socket.io client).
-   **backend/** contains the Node/Express server (Socket.io server, file persistence).
-   **package.json (root)** defines a script to run both servers concurrently.

Prerequisites
-------------

-   **Node.js** (v14 or higher recommended)
    - I used version 20.10.0
-   **npm** (comes with Node)

Installation
------------

1.  **Clone** this repository from GitHub:

    `git clone https://github.com/EliWoodard/MapSimulator.git`

2.  **Install dependencies for both folders** (automated via the root `package.json`):

    `npm install`

    This will:

    -   Install the root-level dependencies (like `concurrently`).

    -   Automatically run `npm install` in both `frontend` and `backend` (if configured in the root scripts---see below for details).

    > If you prefer to install manually, you can `cd frontend && npm install` and `cd backend && npm install` separately.

Running the App
---------------

### One-Command Start

In the **root** directory (where this README is located), run:

`npm start`

This will:

-   Start the **backend** server (Node/Express) on port **5000**.
-   Start the **frontend** React dev server on port **3000**.
-   Open your browser at `http://localhost:3000` (if it doesn't open automatically).

### Stopping the App

Press `Ctrl + C` in the terminal to stop both servers.

Usage
-----

-   Go to http://localhost:3000 in your browser.
-   Add objects (tiles, circles, etc.) using the toolbar buttons.
-   Drag or resize objects on the canvas; changes will be synchronized across connected clients in real time.
-   Press `Delete` or `Backspace` to remove the currently selected object.
-   All objects are persisted in a JSON file (`canvasObjects.json`) on the server, so if you refresh or reconnect, the same state appears.

Scripts Reference
-----------------

Inside the root `package.json`, you might see scripts like:
```
{
  "scripts": {
    "install": "cd frontend && npm install && cd ../backend && npm install",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "cd backend && node server.js",
    "start:frontend": "cd frontend && npm start"
  },
  "devDependencies": {
    "concurrently": "^7.0.0"
  }
}
```
-   **install**: Installs dependencies in both `/frontend` and `/backend`.
-   **start**: Uses [**concurrently**](https://www.npmjs.com/package/concurrently) to start both servers at once.
-   **start:backend**: Runs the Node server (`server.js`) on port 5000.
-   **start:frontend**: Runs the React dev server on port 3000.

Contributing
------------

1.  Fork this repository
2.  Create your feature branch: `git checkout -b feature/my-new-feature`
3.  Commit your changes: `git commit -m 'Add some feature'`
4.  Push to the branch: `git push origin feature/my-new-feature`
5.  Create a new Pull Request

License
-------

This project is open source. You can modify or distribute as needed.