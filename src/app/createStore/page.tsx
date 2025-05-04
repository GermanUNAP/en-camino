"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { createStore, uploadStoreCoverImage } from "@/lib/storeService"; // Importa uploadStoreCoverImage
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid'; // Importa uuidv4
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  images: File[];
}

export default function CreateStorePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeCategory, setStoreCategory] = useState("");
  const [storeCoverImage, setStoreCoverImage] = useState<File | null>(null);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    images: [],
  });
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error("Usuario no autenticado.");
      return;
    }
    setIsSubmittingStore(true);
    toast.loading("Creando tu tienda...", { id: "create-store" });
    try {
      let coverImageUrl: any;
      if (storeCoverImage) {
        coverImageUrl = await uploadStoreCoverImage(storeCoverImage, uuidv4()); 
        if (!coverImageUrl) {
          toast.error("Error al subir la imagen de portada.", { id: "create-store" });
          setIsSubmittingStore(false);
          return;
        }
      }

      const storeId = await createStore({
        userId: user.uid,
        name: storeName,
        description: storeDescription,
        address: storeAddress,
        phone: storePhone,
        category: storeCategory,
        coverImage: coverImageUrl, 
      });
      toast.success(`Tienda "${storeName}" creada correctamente`, { id: "create-store" });
      router.push(`/store/${storeId}`);
    } catch (error: any) {
      toast.error(`Error al crear la tienda: ${error.message}`, { id: "create-store" });
    } finally {
      setIsSubmittingStore(false);
    }
  };

  const handleAddProduct = async () => {
    if (!user?.uid) {
      toast.error("Usuario no autenticado.");
      return;
    }
    setIsSubmittingProduct(true);
    toast.loading("Añadiendo producto...", { id: "add-product" });
    setTimeout(() => {
      toast.success(`Producto "${newProduct.name}" añadido.`, { id: "add-product" });
      setNewProduct({ name: "", description: "", price: 0, images: [] });
      setIsAddingProduct(false);
      setIsSubmittingProduct(false);
    }, 1500);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewProduct({
        ...newProduct,
        images: [...newProduct.images, ...Array.from(e.target.files)],
      });
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStoreCoverImage(e.target.files[0]);
    }
  };


  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-6">Crear una tienda</h1>

      {user?.email === "german@team.nspsac.com" ? (
        <form
          onSubmit={handleCreateStore}
          className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md"
        >
          <div className="mb-4">
            <Label htmlFor="name" className="block text-sm font-bold mb-2">
              Nombre de la Tienda
            </Label>
            <Input
              id="name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="description" className="block text-sm font-bold mb-2">
              Descripción (Opcional)
            </Label>
            <Textarea
              id="description"
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="address" className="block text-sm font-bold mb-2">
              Dirección
            </Label>
            <Input
              id="address"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="phone" className="block text-sm font-bold mb-2">
              Teléfono (Opcional)
            </Label>
            <Input
              id="phone"
              type="tel"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="category" className="block text-sm font-bold mb-2">
              Categoría
            </Label>
            <select
              id="category"
              className="w-full border rounded p-2"
              value={storeCategory}
              onChange={(e) => setStoreCategory(e.target.value)}
              required
            >
              <option value="">Selecciona una categoría</option>
              <option value="alimentos">Alimentos y Gastronomía</option>
              <option value="moda">Moda</option>
              <option value="turismo">Turismo</option>
              <option value="tecnologia">Tecnología</option>
              <option value="salud">Salud</option>
              <option value="artesanias">Artesanías</option>
            </select>
          </div>

          <div className="mb-4">
            <Label htmlFor="coverImage" className="block text-sm font-bold mb-2">
              Imagen de Portada (Opcional)
            </Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmittingStore}>
            {isSubmittingStore ? "Creando..." : "Crear Tienda"}
          </Button>
        </form>
      ) : (
        <p className="text-center text-gray-600">
          No tienes permiso para crear una tienda.
        </p>
      )}

      {user?.email === "german@team.nspsac.sac" && (
        <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
          <h2 className="text-xl font-bold mb-4">Añadir Nuevo Producto</h2>
          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
            <DialogTrigger asChild>
              <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                <Plus className="mr-2" /> Añadir Producto
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalles del Producto</DialogTitle>
                <DialogDescription>
                  Ingresa la información del nuevo producto para tu tienda.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prod-name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="prod-name"
                    className="col-span-3"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prod-desc" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="prod-desc"
                    className="col-span-3"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prod-price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="prod-price"
                    type="number"
                    className="col-span-3"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prod-images" className="text-right">
                    Fotos
                  </Label>
                  <Input
                    id="prod-images"
                    type="file"
                    multiple
                    className="col-span-3"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setIsAddingProduct(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddProduct}
                  disabled={isSubmittingProduct}
                >
                  {isSubmittingProduct ? "Añadiendo..." : "Añadir Producto"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2">
                  Opciones del Producto
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem>Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}