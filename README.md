# DMX Control

DMX Control is a project designed to manage and control DMX lighting systems. This project includes both a backend server and a frontend application to provide a comprehensive solution for DMX lighting control.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Ensure you have the following software installed on your machine:

- Node.js (https://nodejs.org/)
- npm (Node Package Manager, comes with Node.js)

### Installation

Open two terminal/command prompt tabs to run the backend and frontend simultaneously.

#### Running the Backend

1. Navigate to the backend directory:
    ```sh
    cd dmx-control/backend
    ```

2. Install the backend dependencies:
    ```sh
    npm install
    ```

3. Start the backend server:
    ```sh
    node index.js
    ```

#### Running the Frontend

1. Navigate to the frontend directory:
    ```sh
    cd dmx-control
    ```

2. Install the frontend dependencies:
    ```sh
    npm install
    ```

3. Navigate to the `src` directory:
    ```sh
    cd src
    ```

4. Start the frontend application:
    ```sh
    npm start
    ```

### Usage

Once both the backend and frontend are running, you can access the DMX Control application in your web browser. The frontend application will communicate with the backend server to control the DMX lighting system.

### Project Structure

- `backend/`: Contains the backend server code.
- `src/`: Contains the frontend application code.

### Features

- Control DMX lighting systems.
- Smooth transitions for DMX values.
- Scene management and cycling.
- Real-time updates and control.
