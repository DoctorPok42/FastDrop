import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material/';
import FileUpload from '../FileUpload';
import TextInterface from '../TextInterface';

import styles from './styles.module.scss'

interface PopupProps {
    device: any;
    onClose: () => void;
    handleFileUpload: (files: File[]) => void;
    handleSendText: (text: string) => void;
    handleUrlUpload: (url: string) => void;
    showPopup: boolean;
}

const Popup = ({
    device,
    onClose,
    handleFileUpload,
    handleSendText,
    handleUrlUpload,
    showPopup,
}: PopupProps) => {
    const [isTextOpen, setIsTextOpen] = useState(false);
    const [isLinkOpen, setIsLinkOpen] = useState(false);

    return (
        <div className={styles.popup} style={{
                visibility: showPopup ? 'visible' : 'hidden',
        }}>
            <div className={styles.popup__content} style={{
                transform: showPopup ? 'scale(1)' : 'scale(0)',
                visibility: showPopup ? 'visible' : 'hidden',
            }}>
                <div className={styles.popup_cont}>
                <div className={styles.popupLink__close}>
                    <IconButton>
                        <Close onClick={() => onClose()} style={{
                            color: 'var(--white)',
                            fontSize: '1.5rem',
                        }} />
                    </IconButton>
                </div>

                <div className={styles.popup__title}>
                    <h2>{device.userName}</h2>
                </div>

                <div className={styles.popup__items}>
                    {!isLinkOpen && <TextInterface isOpen={isTextOpen} setIsOpen={setIsTextOpen} onChange={(text) => handleSendText(text)} type="txt" />}
                    {(!isTextOpen && !isLinkOpen) && <FileUpload onFileUpload={(files) => handleFileUpload(files)} targetName={device.userName} />}
                    {!isTextOpen && <TextInterface isOpen={isLinkOpen} setIsOpen={setIsLinkOpen} onChange={(url) => handleUrlUpload(url)} type="url" />}
                </div>
                </div>
            </div>
        </div>
    )
}

export default Popup;
