# Build Windows Desktop App (EXE)

This project uses **Electron** to wrap the React application into a standalone Windows Executable.

## Prerequisites
- Node.js installed.
- Dependencies installed (`npm install`).

## Build Command
To generate the `.exe` file, run:

```bash
npm run electron:build
```

## Output
The generated installer will be located in:
`release/Matrix Machine Learning Setup 0.0.0.exe`

## Development
To run the Electron app in development mode (with Hot Reloading):

```bash
npm run electron:dev
```
