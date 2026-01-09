'use client'

import { useEffect, useState } from 'react';

interface Friend {
  id: number;
  friend: {
    firstName: string;
    lastName: string;
  };
}

export default function FriendsList({ userId }: { userId: number }) {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    fetch(`/api/list-friends?userId=${userId}`)
      .then((res) => res.json())
      .then(setFriends)
      .catch((error) => console.error('Error al cargar amigos:', error));
  }, [userId]);

  return (
    <div>
      <h2 className="font-bold text-brand-primary mb-4">Lista de Amigos</h2>
      {friends.length > 0 ? (
        <ul className="space-y-2">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className="border border-brand-border rounded p-3 bg-white text-gray-800"
            >
              {friend.friend.firstName} {friend.friend.lastName}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No tienes amigos aún.</p>
      )}
    </div>
  );
}

