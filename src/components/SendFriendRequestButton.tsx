'use client'

import { Button } from '@/components/ui/button';

export default function SendFriendRequestButton({
  userId,
  friendId,
}: {
  userId: number;
  friendId: number;
}) {
  const handleSendRequest = async () => {
    await fetch('/api/send-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, friendId }),
    });
    alert('Solicitud enviada con éxito.');
  };

  return (
    <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSendRequest}>
      Enviar Solicitud
    </Button>
  );
}
