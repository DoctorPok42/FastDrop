import { useState } from 'react';
import Popup from '../Popup';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaptop, faMobileScreenButton } from '@fortawesome/free-solid-svg-icons';
import { IconButton, Zoom } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import styles from './styles.module.scss'

interface DeviceProps {
  device: any
  myName: string
  handleFileUpload: any
  handleSendText: (text: string) => void
  handleUrlUpload: (url: string) => void
  status: number
  userNameSender: [string, string]
}

const Device = ({
  device,
  myName,
  handleFileUpload,
  handleSendText,
  handleUrlUpload,
  status,
  userNameSender,
}: DeviceProps) => {
  const [showPopup, setShowPopup] = useState(false);
    if (device.userName === myName) return null;

    const NameTooltip = styled(({ className, ...props }: any) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: 'var(--orange)',
            color: 'var(--black-light)',
            boxShadow: theme.shadows[1],
            fontSize: 14,
            fontFamily: 'var(--font)',
            fontWeight: 600,
            borderRadius: '1em',

        },
        [`& .${tooltipClasses.arrow}`]: {
            color: 'var(--orange)',
        },
    }));

    const handleClicked = () => {
        setShowPopup(true);
    }

    console.log('device', userNameSender)

    return (
        <div className={styles.device}>
          {(userNameSender[0] === device.userName || userNameSender[1] === myName) &&
            <div className={styles.progress}>
              <CircularProgressbar value={status} maxValue={100} styles={buildStyles({
                pathColor: 'var(--orange)',
                trailColor: 'var(--blue)',
                strokeLinecap: 'round',
                backgroundColor: 'var(--black)',
                pathTransitionDuration: 0.5,
              })} />
            </div>
          }

          <div className={styles.device__icon}>
              <NameTooltip
                  title={device.userName}
                  placement="top"
                  TransitionComponent={Zoom}
                  TransitionProps={{ timeout: 80 }}
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
