'use client'

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FriendRequest {
  id: number;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export default function FriendRequests({ userId }: { userId: number }) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    fetch(`/api/list-requests?userId=${userId}`)
      .then((res) => res.json())
      .then(setRequests)
      .catch((error) => console.error('Error al cargar solicitudes:', error));
  }, [userId]);

  const handleAccept = async (requestId: number) => {
    await fetch('/api/accept-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    setRequests(requests.filter((req) => req.id !== requestId));
  };

  const handleReject = async (requestId: number) => {
    await fetch('/api/reject-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    });
    setRequests(requests.filter((req) => req.id !== requestId));
  };

  return (
    <div>
      <h2 className="font-bold text-green-800 mb-4">Solicitudes de Amistad</h2>
      {requests.length > 0 ? (
        <ul>
          {requests.map((req) => (
            <li key={req.id} className="mb-2 flex justify-between items-center">
              <span>
                {req.sender.firstName} {req.sender.lastName}
              </span>
              <div>
                <Button
                  className="mr-2 bg-green-500 hover:bg-green-600"
                  onClick={() => handleAccept(req.id)}
                >
                  Aceptar
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => handleReject(req.id)}
                >
                  Rechazar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes solicitudes pendientes.</p>
      )}
    </div>
  );
}
