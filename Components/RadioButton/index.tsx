import { faGlobe, faArrowsLeftRightToLine, faWifi } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from './styles.module.scss';

interface RadioButtonProps {
    value: string;
    onChange: (value: string) => void;
}

const RadioButton = ({
    value,
    onChange,
}: RadioButtonProps) => {
    const listTab = [{'1': faGlobe}, {'2': faArrowsLeftRightToLine}, {'3': faWifi}];

    return (
        <div className={styles.radioButton}>
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
