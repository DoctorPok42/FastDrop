import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import styles from './style.module.scss';

interface SelectUserProps {
  users: {
    userName: string;
    socketId: string;
  }[];
  onCreate: (users: { userName: string; socketId: string }[]) => void;
  onClose: () => void;
  myName: string;
}

const SelectUser = ({ users, onCreate, onClose, myName }: SelectUserProps) => {
  const [userSelected, setUserSelected] = useState<{ userName: string; socketId: string }[]>([]);

  return (
    <div className={styles.SelectUser_container}>
      <div className={styles.SelectUser}>
        <div className={styles.SelectUser_title}>
          <h2>Select User</h2>
          <FontAwesomeIcon icon={faTimes} className={styles.SelectUser_close} onClick={onClose} />
        </div>
          <p>Choose some users to add to the room</p>

        <div className={styles.SelectUser_list}>
          {users.map((user) =>
            user.userName === myName ? null : (
              <div key={user.socketId} className={styles.SelectUser_item}>
                <input
                  type="checkbox"
                  id={user.socketId}
                  checked={userSelected.some((u) => u.socketId === user.socketId)}
                  onChange={() => {
                    if (userSelected.some((u) => u.socketId === user.socketId)) {
                      setUserSelected(userSelected.filter((u) => u.socketId !== user.socketId));
                    } else {
                      setUserSelected([...userSelected, user]);
                    }
                  }}
                />
                <label htmlFor={user.socketId} className={styles.SelectUser_label}>
                  {user.userName}
                </label>
              </div>
            )
          )}

          <div className={styles.SelectUser_buttons}>
          <button
            onClick={() => {
              onCreate(userSelected);
              onClose();
            }}
            style={{
              backgroundColor: userSelected.length === 0 ? 'var(--grey)' : 'var(--orange)',
              color: userSelected.length === 0 ? 'var(--white)' : 'var(--black)',
              boxShadow: userSelected.length === 0 ? 'none' : 'none',
              cursor: userSelected.length === 0 ? 'not-allowed' : 'pointer',
            }}
            disabled={userSelected.length === 0}
          >
            Create Room
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectUser;
