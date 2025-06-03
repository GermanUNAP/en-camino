"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import Image from "next/image";
import { Menu, LogIn, Search, Store, User as UserIcon, ShoppingBag, Landmark } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { STORE_CATEGORIES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import ComboBoxCiudad from "./CityCombobox";
import { City } from "@/types/city";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [storeSearchTerm, setStoreSearchTerm] = useState<string>("");
  const [productSearchTerm, setProductSearchTerm] = useState<string>("");

  const navbarCategories = STORE_CATEGORIES.map((cat) => ({
    label: cat.name,
    href: `/categorias/${cat.slug}`,
  }));

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, setUser);

    const queryCity = searchParams.get("ciudad");
    const queryCategory = searchParams.get("categoria");
    const queryStore = searchParams.get("tienda");
    const queryProduct = searchParams.get("producto");

    if (queryCity) {
      setSelectedCity({ slug: queryCity, name: queryCity } as City);
    }
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
    if (queryStore) {
      setStoreSearchTerm(queryStore);
    }
    if (queryProduct) {
      setProductSearchTerm(queryProduct);
    }

    return () => unsubscribe();
  }, [searchParams]);

  const handleCitySelect = (city: City | null) => {
    setSelectedCity(city);
    closeMenu();
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    closeMenu();
  };

  const handleStoreSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStoreSearchTerm(event.target.value);
  };

  const handleProductSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProductSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const queryParams = new URLSearchParams();

    if (storeSearchTerm.trim()) queryParams.set("tienda", storeSearchTerm);
    if (productSearchTerm.trim()) queryParams.set("producto", productSearchTerm);

    if (selectedCategory) queryParams.set("categoria", selectedCategory);
    if (selectedCity?.slug) queryParams.set("ciudad", selectedCity.slug);

    const queryString = queryParams.toString();
    router.push(`/resultados${queryString ? `?${queryString}` : ""}`);
    closeMenu();
  };

  const getUserInitials = (user: User | null) => {
    if (!user) return "?";
    if (user.displayName) {
      const parts = user.displayName.split(" ");
      if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      }
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  return (
    <nav className="w-full px-6 py-2 bg-background shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold text-foreground">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={closeMenu}>
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

        <button className="md:hidden text-muted-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={28} />
        </button>

        <div className="hidden md:flex flex-wrap items-center justify-end gap-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <Landmark className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar tiendas..."
              className="border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={storeSearchTerm}
              onChange={handleStoreSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
            />
          </form>
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <ShoppingBag className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={productSearchTerm}
              onChange={handleProductSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
            />
          </form>
          <div className="mr-4">
            <ComboBoxCiudad onSeleccionarCiudad={handleCitySelect} selectedCity={selectedCity} />
          </div>
          <div className="w-52">
            <Select onValueChange={handleCategorySelect} value={selectedCategory}>
              <SelectTrigger className="w-full">
                <Store className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {STORE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" onClick={handleSearchSubmit} className="ml-2 font-semibold gap-1">
            <Search size={16} />
            Buscar
          </Button>

          {!user ? (
            <Link href="/login" onClick={closeMenu}>
              <Button className="bg-primary text-white hover:bg-primary/90 font-semibold gap-1">
                <LogIn size={16} />
                Iniciar sesión
              </Button>
            </Link>
          ) : (
            <DropdownMenu onOpenChange={(open) => !open && closeMenu()}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full overflow-hidden w-10 h-10 hover:opacity-80">
                  <Avatar>
                    {user.photoURL ? (
                      <AvatarImage src={user.photoURL} alt={user.displayName || "Perfil"} />
                    ) : (
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/perfil" onClick={closeMenu}>
                  <DropdownMenuItem className="text-foreground font-semibold hover:opacity-80 gap-2 cursor-pointer">
                    <UserIcon size={16} />
                    Ver perfil
                  </DropdownMenuItem>
                </Link>
                <Link href="/createStore" onClick={closeMenu}>
                  <DropdownMenuItem className="text-foreground font-semibold hover:opacity-80 gap-2 cursor-pointer">
                    <Store size={16} />
                    Crear tienda
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-[calc(100%+8px)] left-0 w-full bg-background shadow-lg p-6 flex flex-col gap-4 z-40">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <Landmark className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar tiendas..."
              className="border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
              value={storeSearchTerm}
              onChange={handleStoreSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
            />
          </form>
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <ShoppingBag className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
              value={productSearchTerm}
              onChange={handleProductSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
            />
          </form>
          <div>
            <ComboBoxCiudad onSeleccionarCiudad={handleCitySelect} selectedCity={selectedCity} />
          </div>
          <div>
            <Select onValueChange={handleCategorySelect} value={selectedCategory}>
              <SelectTrigger>
                <Store className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {STORE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" onClick={handleSearchSubmit} className="font-semibold gap-1 w-full">
            <Search size={16} />
            Buscar
          </Button>

          {user ? (
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/perfil" onClick={closeMenu}>
                <Button className="font-semibold hover:opacity-80 w-full gap-1">
                  <UserIcon size={16} />
                  Ver perfil
                </Button>
              </Link>
              <Link href="/createStore" onClick={closeMenu}>
                <Button className="font-semibold hover:opacity-80 w-full gap-1">
                  <Store size={16} />
                  Crear tienda
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/login" className="mt-4" onClick={closeMenu}>
              <Button className="bg-primary text-white hover:bg-primary/90 font-semibold w-full gap-1">
                <LogIn size={16} />
                Iniciar sesión
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}