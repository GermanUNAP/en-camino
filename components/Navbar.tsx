"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import Image from "next/image";
import { Menu, LogIn, LogOut, Search, Store, User as UserIcon, ShoppingBag, Landmark } from "lucide-react";
import { // Ensure these imports are available from your previous version
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { STORE_CATEGORIES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation"; // Changed from usePathname for search functionality
import ComboBoxCiudad from "./CityCombobox"; // Assuming this component exists
import { City } from "@/types/city"; // Assuming this type exists
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; // Assuming these components exist

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for search functionality (re-introduced from your first request)
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [storeSearchTerm, setStoreSearchTerm] = useState<string>("");
  const [productSearchTerm, setProductSearchTerm] = useState<string>("");

  const navbarCategories = STORE_CATEGORIES.map((cat) => ({
    label: cat.name,
    href: `/categorias/${cat.slug}`,
  }));

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, setUser);

    // Re-introduce search parameter parsing from your first request
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

  const handleLogout = () => {
    const auth = getAuth(app);
    signOut(auth);
  };

  // Handlers for search functionality (re-introduced from your first request)
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
          {/* Re-introduce search bars and selectors */}
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
          {/* End re-introduced search bars and selectors */}

          {!user ? (
            <Link href="/login">
              <Button className="bg-primary text-white hover:bg-primary/90 font-semibold gap-1">
                <LogIn size={16} />
                Iniciar sesión
              </Button>
            </Link>
          ) : (
            <DropdownMenu>
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
                <Link href="/perfil">
                  <DropdownMenuItem className="text-foreground font-semibold hover:opacity-80 gap-2">
                    <UserIcon size={16} />
                    Ver perfil
                  </DropdownMenuItem>
                </Link>
                {/* No longer using 'isAuthorized' for 'Crear tienda' as per initial request to remove it */}
                <Link href="/createStore">
                  <DropdownMenuItem className="text-foreground font-semibold hover:opacity-80 gap-2">
                    <Store size={16} />
                    Crear tienda
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:text-destructive/80 font-semibold gap-2">
                  <LogOut size={16} />
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
          {/* Re-introduce search bars and selectors for mobile */}
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
          {/* End re-introduced search bars and selectors for mobile */}

          {!user ? (
            <Link href="/login">
              <Button className="bg-primary text-white hover:bg-primary/90 font-semibold w-full gap-1">
                <LogIn size={16} />
                Iniciar sesión
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/perfil">
                <Button className="text-foreground font-semibold hover:opacity-80 w-full gap-1">
                  <UserIcon size={16} />
                  Ver perfil
                </Button>
              </Link>
              {/* No longer using 'isAuthorized' for 'Crear tienda' as per initial request to remove it */}
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