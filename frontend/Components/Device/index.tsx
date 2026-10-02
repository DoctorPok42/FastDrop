import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLaptop, faMobileScreenButton } from '@fortawesome/free-solid-svg-icons';
import 'react-circular-progressbar/dist/styles.css';

import styles from './styles.module.scss'

interface DeviceProps {
  device: any
  myName: string
  setSelectedDevice: (device: any) => void
}

const Device = ({
  device,
  myName,
  setSelectedDevice
}: DeviceProps) => {
  if (device.userName === myName) return null;

  const handleClicked = () => {
    setSelectedDevice(device);
  }

  return (
    <div className={`${styles.device} border border-divider!`} onClick={() => handleClicked()}>
      <div className={styles.device__header}>
        <div className={styles.device__icon}>
          {device.userDeviceType === 'desktop' ?
            <FontAwesomeIcon className={styles.icon} icon={faLaptop} style={{
              width: '2.6rem',
            }} />
            :
            <FontAwesomeIcon className={styles.icon} icon={faMobileScreenButton} style={{
              width: '1.8rem',
            }} />
          }
        </div>
      </div>

      <div className={styles.device__body}>
        <span className={styles.device__name}>
          {device.userName}
        </span>
        <span className={styles.device__type}>
          {device.userDeviceType === 'desktop' ? 'Desktop' : 'Mobile'} - ready
        </span>
      </div>
    </div>
  )
}

export default Device
