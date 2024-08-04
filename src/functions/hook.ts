import io from "socket.io-client";

const sendFile = (
  files: File[],
  socket: any,
  targetUser: string,
  username: string
) => {
  if (files.length === 0) return;

  if (files.length > 1) {
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = async () => {
          const fileBuffer = Buffer.from(reader.result as ArrayBuffer);
          await socket.emit(
            "fileUploadLarge",
            fileBuffer,
            file.name,
            targetUser,
            username,
            i,
            files.length
          );
        };

        reader.onerror = () => {
          console.log("Error while reading file");
        };
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = () => {
        const fileBuffer = Buffer.from(reader.result as ArrayBuffer);
        socket.emit(
          "fileUpload",
          fileBuffer,
          file.name,
          targetUser,
          username,
          (status: any) => {
            console.log("status", status);
          }
        );
      };

      reader.onerror = () => {
        console.log("Error while reading file");
      };
    } catch (error) {
      console.log(error);
    }
  }
};

const sendText = (
  text: string,
  socket: any,
  targetUser: string,
  username: string
) => {
  socket.emit("textUpload", text, targetUser, username);
};

const sendUrl = (
  url: string,
  socket: any,
  targetUser: string,
  username: string
) => {
  socket.emit("urlUpload", url, targetUser, username);
};

const handleUpload = async (
  socket: any,
  type: "file" | "txt" | "url" | "none" = "none",
  username: string,
  targetUser: string,
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
          sendText(text, socket, targetUser, username);
        }
        break;
      case "url":
        if (url && url.length > 0) {
          sendUrl(url, socket, targetUser, username);
        }
        break;
      default:
        break;
    }
  }
};

export default handleUpload;
