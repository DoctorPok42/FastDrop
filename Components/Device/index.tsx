import { useState } from 'react';
import Popup from '../Popup';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaptop, faMobileScreenButton } from '@fortawesome/free-solid-svg-icons';
import { IconButton, Zoom } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import styles from './styles.module.scss'

interface DeviceProps {
    device: any
    myName: string
    handleFileUpload: any
    handleSendText: (text: string) => void
    handleUrlUpload: (url: string) => void
}

const Device = ({
    device,
    myName,
    handleFileUpload,
    handleSendText,
    handleUrlUpload,
}: DeviceProps) => {
    if (device.userName === myName) return null;
    const [showPopup, setShowPopup] = useState(false);

    const NameTooltip = styled(({ className, ...props }: any) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: 'var(--orange)',
            color: 'var(--white)',
            boxShadow: theme.shadows[1],
            fontSize: 13,
            fontFamily: 'var(--font)',

        },
        [`& .${tooltipClasses.arrow}`]: {
            color: 'var(--orange)',
        },
    }));

    const handleClicked = () => {
        setShowPopup(true);
    }

    return (
        <div className={styles.device}>
            <div className={styles.device__icon}>
                <NameTooltip
                    title={device.userName}
                    placement="top"
                    TransitionComponent={Zoom}
                    TransitionProps={{ timeout: 100 }}
                    arrow
                >
                    <IconButton onClick={() => handleClicked()}>
                        {device.userDeviceType === 'desktop' ?
                            <FontAwesomeIcon className={styles.icon} icon={faLaptop} style={{
                                width: '2.6rem',
                            }} />
                        :
                            <FontAwesomeIcon className={styles.icon} icon={faMobileScreenButton} style={{
                                width: '1.8rem',
                            }} />
                        }
                    </IconButton>
                </NameTooltip>
            </div>

            {<div className={styles.device__popup}>
                <Popup
                    device={device}
                    onClose={() => setShowPopup(false)}
                    handleFileUpload={handleFileUpload}
                    handleSendText={handleSendText}
                    handleUrlUpload={handleUrlUpload}
                    showPopup={showPopup}
                />
            </div>}
        </div>
    )
}

export default Device
