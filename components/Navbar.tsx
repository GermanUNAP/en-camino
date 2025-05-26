"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import Image from "next/image";
import { Menu, LogIn, LogOut, Search, Store, User as UserIcon, UserPlus, ShoppingBag, Landmark } from "lucide-react"; // Added ShoppingBag and Landmark icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { STORE_CATEGORIES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
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
  }, [searchParams]); // Depend on searchParams to re-run when URL changes

  const handleLogout = () => {
    const auth = getAuth(app);
    signOut(auth);
  };

  const handleCitySelect = (city: City | null) => {
    setSelectedCity(city);
  };

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
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

        {/* Botón menú móvil */}
        <button className="md:hidden text-muted-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={28} />
        </button>

        {/* Navegación escritorio */}
        <div className="hidden md:flex flex-wrap items-center justify-end gap-4">
          {/* Barra de búsqueda para Tiendas */}
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <Landmark className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar tiendas..."
              className="border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={storeSearchTerm}
              onChange={handleStoreSearchChange}
            />
          </form>
          {/* Barra de búsqueda para Productos */}
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <ShoppingBag className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={productSearchTerm}
              onChange={handleProductSearchChange}
            />
          </form>
          <div className="mr-4">
            <ComboBoxCiudad onSeleccionarCiudad={handleCitySelect} selectedCity={selectedCity} />
          </div>
          {/* Selector de categorías */}
          <div className="w-52">
            <Select onValueChange={handleCategorySelect} value={selectedCategory}>
              <SelectTrigger className="w-full">
                <Store className="mr-2 h-4 w-4 text-gray-400" /> {/* Icono en el trigger */}
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
            <>
              <Link href="/login">
                <Button className="bg-primary text-white hover:bg-primary/90 font-semibold gap-1">
                  <LogIn size={16} />
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="text-primary border-primary hover:text-primary/80 font-semibold gap-1">
                  <UserPlus size={16} />
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
                  <DropdownMenuItem className="text-foreground font-semibold hover:opacity-80 gap-2">
                    <UserIcon size={16} />
                    Ver perfil
                  </DropdownMenuItem>
                </Link>
                
                <Link href="/createStore">
                  <DropdownMenuItem className="text-foreground font-semibold hover:opacity-80 gap-2">
                    <Store size={16} />
                    Crear tienda
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive/80 font-semibold gap-2"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Navegación móvil */}
      {menuOpen && (
        <div className="mt-4 flex flex-col md:hidden gap-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center mb-2 relative">
            <Landmark className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar tiendas..."
              className="border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
              value={storeSearchTerm}
              onChange={handleStoreSearchChange}
            />
          </form>
          <form onSubmit={handleSearchSubmit} className="flex items-center mb-2 relative">
            <ShoppingBag className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar productos..."
              className="border rounded-md pl-10 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full"
              value={productSearchTerm}
              onChange={handleProductSearchChange}
            />
          </form>
          <Button type="submit" onClick={handleSearchSubmit} className="ml-2 font-semibold gap-1 w-full">
            <Search size={16} />
            Buscar
          </Button>
          <div className="mb-2">
            <ComboBoxCiudad onSeleccionarCiudad={handleCitySelect} selectedCity={selectedCity} />
          </div>
          <div className="mb-2">
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

          {!user ? (
            <>
              <Link href="/login">
                <Button className="bg-primary text-white hover:bg-primary/90 font-semibold w-full gap-1">
                  <LogIn size={16} />
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="text-primary border-primary hover:text-primary/80 font-semibold w-full gap-1">
                  <UserPlus size={16} />
                  Registrarse
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/perfil">
                <Button className="text-foreground font-semibold hover:opacity-80 w-full gap-1">
                  <UserIcon size={16} />
                  Ver perfil
                </Button>
              </Link>
              <Link href="/createStore">
                <Button className="text-foreground font-semibold hover:opacity-80 w-full gap-1">
                  <Store size={16} />
                  Crear tienda
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive/80 font-semibold w-full gap-1">
                <LogOut size={16} />
                Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}