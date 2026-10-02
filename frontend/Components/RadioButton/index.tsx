import { faUsersRectangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from './styles.module.scss';

export interface RadioButtonProps {
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
  const listTab = ["Everyone", "Nearby", "Same Network"];

  return (
    <div className={styles.radioButton}>
      {nbOfUsers > 2 && <div className={styles.roomButton}>
        <FontAwesomeIcon icon={faUsersRectangle} className={styles.icon} onClick={onClick} style={{
          color: isActive ? 'var(--accent) !important' : 'var(--white) !important',
        }} />
      </div>}

      <ul className={styles.radioList}>
        {listTab.map((item, index) => (
          <li className={
            value === (index + 1).toString() ? styles.itemListActive : styles.itemList
          } key={index} onClick={() => onChange((index + 1).toString())}>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RadioButton;
