<div align="center">
    <img src="public/favicon.ico" width="30%">
</div>

# Fastdrop

## The easiest way to transfer files across devices

Fastdrop is a web application that allows users to easily transfer files between devices. It uses a peer-to-peer connection, so no files are ever stored on a server. This makes it a secure and private way to share files.

## Features

- 📁 **Drag and drop** - Users can drag and drop files to transfer
- 🔒 **Secure** - Files are transferred directly between devices, so no files are ever stored on a server
- 📦 **Chunked file transfer** - Large files are split into smaller chunks and sent one by one to ensure reliable transfer
- 🔐 **Privacy levels** - Users can choose to share files with everyone, only close people, or only people on the same network
- 👥 **Rooms** - Users can create rooms to share files with multiple people at once
- ⚡ **Fast** - Files are transferred quickly and efficiently
- 🌐 **Cross-platform** - Works on any device with a web browser
- 🆓 **Free** - Fastdrop is completely free to use
- 🛠️ **Open source** - Fastdrop is open source, so anyone can contribute to the project
- 📱 **Mobile friendly** - Fastdrop is optimized for mobile devices, so users can easily transfer files on the go

## Installation

1. Clone the repository

```bash
git clone git@github.com:DoctorPok42/FastDrop.git
```

2. Install dependencies

```bash
npm install
```

3. Add .env file

```bash
touch .env
```

4. Add the following variables to the .env file

```bash
URL_SERVER=http://localhost:3001
```

5. Run the server and client in development mode with hot module replacement

```bash
npm run dev

node .\src.\socket-server.\server.mjs
```

## Usage

1. Go to [http://localhost:3000](http://localhost:3000)

2. Connect a second device

3. Drag and drop files to transfer them

4. Enjoy!

## Tech

- [Next.js](https://nextjs.org/)
- [Socket.io](https://socket.io/)
- [React Dropzone](https://react-dropzone.js.org/)
- [Unique Names Generator](https://www.npmjs.com/package/unique-names-generator)
- [TS](https://www.typescriptlang.org/)
- [SASS](https://sass-lang.com/)
- [Material UI](https://material-ui.com/)

## Folder structure

- **components** - Contains all the components used in the project
- **pages** - Contains all the pages used in the project
- **public** - Contains all the static files used in the project
- **styles** - Contains all the styles used in the project
- **socket-server** - Contains the socket server used in the project

## License

[MIT](https://github.com/DoctorPok42/HangMan/blob/main/LICENSE)
