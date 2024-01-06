import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from './styles.module.scss'

interface ItemProps {
    title: string;
    img: IconProp;
    onClick?: () => void;
}

const Item = ({
    title,
    img,
    onClick,
}: ItemProps) => {
    return (
        <div className={styles.item} onClick={() => onClick && onClick()}>
            <div className={styles.item__icon}>
                <FontAwesomeIcon icon={img} style={{
                    width: '2.6rem',
                }} />
            </div>

            <div className={styles.item__title}>
                <h2>{title}</h2>
            </div>
        </div>
    )
}

export default Item;
