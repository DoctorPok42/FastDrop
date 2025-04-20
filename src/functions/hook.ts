const sendFileInChunks = (
  file: File,
  socket: any,
  targetUser: string,
  username: string,
  chunkSize = 1024 * 1024 // 1MB
) => {
  const reader = new FileReader();
  let offset = 0;
  const totalChunks = Math.ceil(file.size / chunkSize);
  const fileId = `${file.name}-${Date.now()}`;

  const readNextChunk = () => {
    const slice = file.slice(offset, offset + chunkSize);
    reader.readAsArrayBuffer(slice);
  };

  reader.onload = () => {
    const chunk = reader.result;
    socket.emit("fileChunk", {
      fileId,
      chunk,
      fileName: file.name,
      targetUser,
      username,
      currentChunk: offset / chunkSize,
      totalChunks,
    });

    offset += chunkSize;
    if (offset < file.size) {
      readNextChunk();
    } else {
      socket.emit("fileChunkEnd", {
        fileId,
        fileName: file.name,
        targetUser,
        username,
      });
    }
  };

  reader.onerror = () => {
    console.error("Erreur lors de la lecture du fichier.");
  };

  readNextChunk();
};

const sendFile = (
  files: File[],
  socket: any,
  targetUser: string,
  username: string
) => {
  if (files.length === 0) return;

  try {
    for (const file of files) {
      sendFileInChunks(file, socket, targetUser, username);
    }
  } catch (error) {
    console.error(error);
  }
};

const sendText = (
  text: string,
  socket: any,
  targetUser: string,
  username: string,
  setStatus: (status: number) => void
) => {
  socket.emit("textUpload", text, targetUser, username, (response: any) => {
    if (response.status === 200) {
      setStatus(200);
    } else if (response.status === 400) {
      setStatus(400);
    } else if (response.status === 500) {
      setStatus(500);
    }
  });
};

const sendUrl = (
  url: string,
  socket: any,
  targetUser: string,
  username: string,
  setStatus: (status: number) => void
) => {
  socket.emit("urlUpload", url, targetUser, username, (response: any) => {
    if (response.status === 200) {
      setStatus(200);
    } else if (response.status === 400) {
      setStatus(400);
    } else if (response.status === 500) {
      setStatus(500);
    }
  });
};

const handleUpload = async (
  socket: any,
  type: "file" | "txt" | "url" | "none" = "none",
  username: string,
  targetUser: string,
  setStatus: (status: number) => void,
  file?: File[],
  text?: string,
  url?: string
) => {
  if (type === "none") return;

  if (targetUser) {
    switch (type) {
      case "file":
        if (file) {
          sendFile(file, socket, targetUser, username);
        }
        break;
      case "txt":
        if (text && text.length > 0) {
          sendText(text, socket, targetUser, username, setStatus);
        }
        break;
      case "url":
        if (url && url.length > 0) {
          sendUrl(url, socket, targetUser, username, setStatus);
        }
        break;
      default:
        break;
    }
  }
};

export default handleUpload;
