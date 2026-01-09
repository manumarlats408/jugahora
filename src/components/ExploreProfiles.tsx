"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ExploreProfiles({ userId }: { userId: number }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/users`);
        if (!res.ok) throw new Error("Error al cargar perfiles");
        const data = await res.json();
        setUsers(data.filter((user: User) => user.id !== userId)); // Excluir el usuario actual
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId]);

  const handleSendRequest = async (friendId: number) => {
    try {
      const res = await fetch("/api/friends/send-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, friendId }),
      });
      if (res.ok) {
        alert("Solicitud de amistad enviada");
      } else {
        const data = await res.json();
        alert(data.message || "Error al enviar solicitud");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
    }
  };

  if (loading) return <p>Cargando perfiles...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-brand-primary">Explorar Perfiles</h2>
      {users.length > 0 ? (
        users.map((user) => (
          <div key={user.id} className="flex justify-between items-center p-4 border border-brand-border rounded bg-white hover:bg-brand-bg transition-colors duration-300">
            <div>
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Button onClick={() => handleSendRequest(user.id)}>Enviar solicitud</Button>
          </div>
        ))
      ) : (
        <p>No hay otros usuarios disponibles.</p>
      )}
    </div>
  );
}
