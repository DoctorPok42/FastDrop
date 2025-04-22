export type IncomingFile = {
  chunks: Array<ArrayBuffer>;
  totalChunks: number;
  fileName: string;
  username: string;
};
