import { useState } from "react";
import FileUpload from "./FileUpload";
import TextInterface from "./TextInterface";

interface SideBarProps {
  device: any;
  onClose: () => void;
  handleFileUpload: (files: File[]) => void;
  handleSendText: (text: string) => void;
  handleUrlUpload: (url: string) => void;
  showPopup: boolean;
}

const SideBar = ({
  device,
  onClose,
  handleFileUpload,
  handleSendText,
  handleUrlUpload,
  showPopup, }: SideBarProps) => {
  const options = ["File", "Text", "Link"];
  const [selectedOption, setSelectedOption] = useState<string>("File");
  const [text, setText] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSend = () => {
    try {
      if (selectedOption === "File") {
        handleFileUpload(files);
      } else if (selectedOption === "Text") {
        handleSendText(text);
      } else if (selectedOption === "Link") {
        handleUrlUpload(url);
      }
    } catch (error) {
    } finally {
      setIsSending(true);
      setTimeout(() => {
        setIsSending(false);
        setText("");
        setUrl("");
        setFiles([]);
        onClose();
      }, 600);
    }
  }

  const isDisabled = selectedOption === "File" && files.length === 0 || selectedOption === "Text" && text.trim() === "" || selectedOption === "Link" && url.trim() === "";

  return (
    <div className={`fixed inset-0 bg-[rgba(12,13,15,.32)] z-50 justify-end transition-all duration-150 ${showPopup ? 'flex' : 'hidden'}`} onClick={onClose}>
      <div className="sidebar w-[min(460px,100%)] h-full bg-bg flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="z-2 p-6 flex flex-col gap-1.5 bg-inverse text-neutral-100">
          <div className="flex justify-between items-center">
            <span className="uppercase font-mono text-[12px] text-neutral-500 tracking-[0.08em]">send to</span>

            <button
              onClick={onClose}
              className="border-none bg-close text-bg w-9 h-9 rounded-md text-[18px] p-0 m-0 flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-close-hover"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <span className="font-extrabold italic font-stretch-125% text-[34px] tracking-[-0.03em] leading-[1.05] text-inverse-text">
            {device?.userName}
          </span>

          <span className="font-mono text-[12px] text-inv-accent">
            {device?.userDeviceType === 'desktop' ? 'Desktop' : 'Mobile'} - ready
          </span>
        </div>

        <div className="pt-5 px-6">
          <div className="grid p-1 gap-1 bg-surface botder border-neutral-300 rounded-xl" style={{
            gridTemplateColumns: "repeat(3,1fr)"
          }}>
            {options.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedOption(option)}
                className={`border-none cursor-pointer py-2.25 px-2 rounded-md text-[14px] font-semibold text-text transition-all duration-150 hover:bg-disabled hover:text-text ${selectedOption === option ? 'bg-text! text-bg!' : ''}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-auto py-5 px-6 gap-3.5">
          {selectedOption === "File" && <FileUpload onFileUpload={(files) => setFiles(files)} files={files} targetName={device?.userName} />}
          {selectedOption === "Text" && <TextInterface onChange={(text) => setText(text)} type="txt" value={text} />}
          {selectedOption === "Link" && <TextInterface onChange={(url) => setUrl(url)} type="url" value={url} />}
        </div>

        <div className="pt-4 px-6 pb-6 border-t border-divider-strong">
          <button
            onClick={handleSend}
            disabled={isDisabled}
            className="z-2 w-full border-none rounded-2xl p-4.5 font-extrabold italic font-stretch-125% text-[30px] tracking-[0.02em] flex items-center gap-2 justify-center cursor-pointer bg-accent text-[#0c0d0f] transition-all duration-150 hover:bg-accent-400 disabled:bg-disabled disabled:text-disabled-text disabled:cursor-not-allowed">
            {selectedOption === "File" ? "Send File" : selectedOption === "Text" ? "Send Text" : "Send Link"}

            <svg data-dc-tpl="110" width="18" height="18" viewBox="0 0 16 16" fill="none"><path data-dc-tpl="111" d="M2 8h10M8 3.5 12.5 8 8 12.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
          </button>
        </div>

        {isSending && <div className="spanSend"></div>}
      </div>
    </div >
  );
};

export default SideBar;
