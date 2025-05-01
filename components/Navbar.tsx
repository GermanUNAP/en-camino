"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@/lib/firebase"; 

const categories = [
  { label: "Alimentos y Gastronomía", href: "/categorias/alimentos" },
  { label: "Moda", href: "/categorias/moda" },
  { label: "Turismo", href: "/categorias/turismo" },
  { label: "Tecnología", href: "/categorias/tecnologia" },
  { label: "Salud", href: "/categorias/salud" },
  { label: "Artesanías", href: "/categorias/artesanias" },
];

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    return onAuthStateChanged(auth, (user: any) => setUser(user));
  }, []);

  const handleLogout = () => {
    const auth = getAuth(app);
    signOut(auth);
  };

  return (
    <nav className="w-full px-6 py-4 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {categories.map((cat) => (
          <Button variant="ghost" key={cat.label} asChild>
            <Link href={cat.href}>{cat.label}</Link>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {!user ? (
          <Button asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/perfil">Ver perfil</Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
