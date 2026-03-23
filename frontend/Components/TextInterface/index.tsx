import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material/';
import { faPen, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from './styles.module.scss'

interface TextInterfaceProps {
    onChange: (changeText: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    type: 'txt' | 'url';
}

const TextInterface = ({
    onChange,
    isOpen,
    setIsOpen,
    type,
}: TextInterfaceProps) => {
    const [text, setText] = useState('' as string);

    const handleOpen = () => {
        if (!isOpen) {
            setIsOpen(true);
        }
    }

    const handleSend = () => {
        onChange(text);
        setText('');
        setIsOpen(false);
    }
    return (
        <div className={styles.textInterface} style={{
            width: isOpen ? '30em' : '10em',
            border: isOpen ? '5px solid var(--blue)' : 'none',
            backgroundColor: isOpen ? 'var(--white)' : 'var(--blue)',
        }} onClick={() => handleOpen()}>
            {!isOpen ? <>
                <div className={styles.item__icon}>
                    <FontAwesomeIcon icon={type === "url" ? faLink : faPen} style={{
                        width: '2.6rem',
                    }} />
                </div>

                <div className={styles.item__title}>
                  <h2>{
                        type === 'url' ? 'Link' :
                            type === 'txt' ? 'Text' : ''
                    }</h2>
                </div>
            </> : <div className={styles.textInterface__input}>
                    <div className={styles.popupLink__close}>
                        <IconButton>
                            <Close onClick={() => setIsOpen(false)} style={{
                                color: 'var(--blue)',
                                fontSize: '1.5rem',
                            }} />
                        </IconButton>
                    </div>

                    <textarea
                        onChange={(e) => {
                            setText(e.target.value);
                        }}
                        autoFocus
                        className={styles.textarea}
                        name="text"
                        id="text"
                    />

                    <button className={styles.textButton} onClick={() => handleSend()} >Send
                        {type === 'url' ? '  link' : ' text'}
                    </button>
            </div>}
        </div>
    )
}

export default TextInterface;
