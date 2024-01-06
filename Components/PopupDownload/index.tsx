import styles from './styles.module.scss'

interface PopupDownloadProps {
    fileName: any[];
    text: string;
    url: string;
    username: string;
    decline: () => void;
    popupType: 'file' | 'txt' | 'url' | 'none';
    acceptFile: any;
    acceptUrl: any;
    previewUrl: any;
}

const PopupDownload = ({
    fileName,
    text,
    url,
    username = "unknown",
    decline,
    popupType,
    acceptFile,
    acceptUrl,
    previewUrl
}: PopupDownloadProps) => {
    return (
        <main className={styles.popupDownload}>
            <div className={styles.popupContainer}>
                <div className={styles.popupContent}>
                    <div className={styles.popupTitle}>
                        <h1>User <span>{username}</span> wants to send you a {
                            popupType === 'file' ? 'file' :
                                popupType === 'txt' ? 'text' :
                                    popupType === 'url' ? 'link' : ''
                        }</h1>
                    </div>

                    {popupType === 'file' && <div className={styles.popupFile}>
                        {fileName.map((file, index) => (
                            <h2 key={index}>File name: <span>{file.fileName}</span></h2>
                        ))}
                    </div>}

                    {popupType === 'txt' && <div className={styles.popupFile}>
                        <textarea className={styles.popupFileTextarea} name="text" id="text" value={text}></textarea>
                    </div>}

                    {popupType === 'url' && <div className={styles.popupFile}>
                        <h2>URL: <span style={{
                            color: 'var(--blue)',
                        }}>{url}</span></h2>
                    </div>}

                    {previewUrl !== null &&
                        <div className={styles.previewUrl}>
                            <img className={styles.previewUrl} src={previewUrl} alt="File Preview" />
                        </div>
                    }

                    {popupType !== "none" && <div className={styles.popupButtons}>
                        <button className={styles.btnDecline} onClick={() => decline()}>Decline</button>

                        {popupType === "file" && <button className={styles.btnAccept} onClick={() => acceptFile(fileName)}>Accept</button>}

                        {popupType === "txt" && <button className={styles.btnAccept} onClick={(e) => {
                            e.preventDefault();
                            navigator.clipboard.writeText(text);
                        }}>Copy</button>}

                        {popupType === "url" && <button className={styles.btnAccept} onClick={() => acceptUrl(url)}>Open link</button>}
                    </div>}

                </div>
            </div>
        </main>
    )
}

export default PopupDownload;
