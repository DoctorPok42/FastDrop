// UserList.tsx
import React from 'react';

interface UserListProps {
  users: any[];
  onSelectUser: (user: string) => void;
  selectedUser: string | null;
}

const UserList: React.FC<UserListProps> = ({ users, onSelectUser, selectedUser }) => {
  const handleSelectUser = (user: any) => {
    if (selectedUser == user.userName) return;
    onSelectUser(user);
  }

  return (
    <div>
      <ul>
        {users.map((user, index) => (
          <li key={index} onClick={() => handleSelectUser(user)} style={{
            cursor: 'pointer',
            color: user === selectedUser ? "blue" : "black"
          }}>
            {user.userName} ({user.userDeviceType})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
