"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";
import Image from "next/image";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { STORE_CATEGORIES } from "@/lib/constants"; 

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isGerman = user?.email === "german@team.nspsac.com";

  const [navbarCategories, setNavbarCategories] = useState(
    STORE_CATEGORIES.map((cat) => ({
      label: cat.name,
      href: `/categorias/${cat.slug}`,
    }))
  );

  useEffect(() => {
    const auth = getAuth(app);
    return onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
  }, []);

  const handleLogout = () => {
    const auth = getAuth(app);
    signOut(auth);
  };

  return (
    <nav className="w-full px-6 py-2 bg-background shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/assets/images/En-camino-logo.jpeg"
              alt="Logo En Camino"
              width={48}
              height={48}
              className="w-auto h-12"
            />
            <span className="font-semibold text-lg">En camino</span>
          </Link>
        </div>

        {/* Botón para menú en móviles */}
        <button className="md:hidden text-muted-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={28} />
        </button>

        {/* Navegación en escritorio */}
        <div className="hidden md:flex flex-wrap items-center justify-end gap-4">
          {navbarCategories.map((cat) => (
            <Link href={cat.href} key={cat.label}>
              <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold">
                {cat.label}
              </Button>
            </Link>
          ))}

          {!user ? (
            <>
              <Link href="/login">
                <Button className="bg-primary text-white hover:bg-primary/90 font-semibold">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="text-primary border-primary hover:text-primary/80 font-semibold">
                  Registrarse
                </Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full overflow-hidden w-10 h-10 hover:opacity-80">
                  <Avatar>
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.displayName || "Perfil"} />
                    ) : (
                      <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/perfil">
                  <DropdownMenuItem className="text-foreground font-semibold hover:opacity-80">
                    Ver perfil
                  </DropdownMenuItem>
                </Link>
                {isGerman && (
                  <Link href="/createStore">
                    <DropdownMenuItem className="text-foreground font-semibold hover:opacity-80">
                      Crear tienda
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:text-destructive/80 font-semibold">
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Navegación para móviles */}
      {menuOpen && (
        <div className="mt-4 flex flex-col md:hidden gap-2">
          {navbarCategories.map((cat) => (
            <Link href={cat.href} key={cat.label}>
              <Button variant="ghost" className="text-primary hover:text-primary/80 font-semibold">
                {cat.label}
              </Button>
            </Link>
          ))}
          {!user ? (
            <>
              <Link href="/login">
                <Button className="bg-primary text-white hover:bg-primary/90 font-semibold">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="text-primary border-primary hover:text-primary/80 font-semibold">
                  Registrarse
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/perfil">
                <Button className="text-foreground font-semibold hover:opacity-80">
                  Ver perfil
                </Button>
              </Link>
              {isGerman && (
                <Link href="/createStore">
                  <Button className="text-foreground font-semibold hover:opacity-80">
                    Crear tienda
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive/80 font-semibold">
                Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
