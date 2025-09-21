import { faGlobe, faArrowsLeftRightToLine, faWifi, faUsersRectangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from './styles.module.scss';

interface RadioButtonProps {
  value: string;
  onChange: (value: string) => void;
  nbOfUsers: number;
  onClick: () => void;
  isActive: boolean;
}

const RadioButton = ({
  value,
  onChange,
  nbOfUsers,
  onClick,
  isActive,
}: RadioButtonProps) => {
  const listTab = [{'1': faGlobe}, {'2': faArrowsLeftRightToLine}, {'3': faWifi}];

  return (
    <div className={styles.radioButton}>
      {nbOfUsers > 2 && <div className={styles.roomButton}>
        <FontAwesomeIcon icon={faUsersRectangle} className={styles.icon} onClick={onClick} style={{
          color: isActive ? 'var(--blue) !important' : 'var(--white) !important',
        }} />
      </div>}
      <ul className={styles.radioList}>
        {listTab.map((item, index) => (
          <li className={
            value === Object.keys(item)[0] ? styles.itemListActive : styles.itemList
          } key={index} onClick={() => onChange(Object.keys(item)[0])}>
            <FontAwesomeIcon className={styles.icon} icon={Object.values(item)[0]} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RadioButton;
