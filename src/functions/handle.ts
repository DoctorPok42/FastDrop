export const handleDownloadFile = (
  filesToDownload: any[],
  setShowPopupDownload: (showPopupDownload: boolean) => void,
  setFilesToDownload: (filesToDownload: any) => void,
  setUserNameSender: (userNameSender: [string, string]) => void
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
    setShowPopupDownload(false);
    setUserNameSender(["", ""]);
    setFilesToDownload([]);
  }
};

export const handleGetUrl = (
  url: string,
  setShowPopupDownload: (showPopupDownload: boolean) => void,
  setUserNameSender: (userNameSender: [string, string]) => void,
  setFilesToDownload: (filesToDownload: any) => void
) => {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.click();
  setShowPopupDownload(false);
  setUserNameSender(["", ""]);
  setFilesToDownload([]);
};

export const handleDeclineFile = (
  setShowPopupDownload: (showPopupDownload: boolean) => void,
  setFilesToDownload: (filesToDownload: any) => void,
  setUserNameSender: (userNameSender: [string, string]) => void
) => {
  setShowPopupDownload(false);
  setUserNameSender(["", ""]);
  setFilesToDownload([]);
};
