export const handleDownloadFile = (
  filesToDownload: any[],
  setShowPopupDownload: (showPopupDownload: boolean) => void,
  setFilesToDownload: (filesToDownload: any) => void,
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
      }
    });
    setFilesToDownload([]);
    setShowPopupDownload(false);
  }
};

export const handleGetUrl = (
  url: string,
  setShowPopupDownload: (showPopupDownload: boolean) => void
) => {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.click();
  setShowPopupDownload(false);
};

export const handleDeclineFile = (
  setShowPopupDownload: (showPopupDownload: boolean) => void,
  setFilesToDownload: (filesToDownload: any) => void,
) => {
  setFilesToDownload([]);
  setShowPopupDownload(false);
};
