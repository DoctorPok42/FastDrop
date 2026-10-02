export const handleDownloadFile = (
  filesToDownload: any[],
  onComplete?: () => void
) => {
  if (filesToDownload !== null) {
    filesToDownload.forEach((file) => {
      if (file.checked) {
        const url = URL.createObjectURL(file.file);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
    });
  }
  onComplete?.();
};
