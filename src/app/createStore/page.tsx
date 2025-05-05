"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import { createStore, uploadStoreCoverImage } from "@/lib/storeService";
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
import { v4 as uuidv4 } from 'uuid';
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

interface SocialMedia {
  platform: string;
  link: string;
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
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMedia[]>([]);
  const [newSocialMedia, setNewSocialMedia] = useState<SocialMedia>({
    platform: "",
    link: "",
  });
  const [isAddingSocialMedia, setIsAddingSocialMedia] = useState(false);

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
      let coverImageUrl: string | undefined = undefined;
      if (storeCoverImage) {
        const uploadResult = await uploadStoreCoverImage(storeCoverImage, uuidv4());
        if (uploadResult) {
          coverImageUrl = uploadResult;
        } else {
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
        socialMedia: socialMediaLinks, // Guarda los links de redes sociales
      });
      toast.success(`Tienda "${storeName}" creada correctamente`, { id: "create-store" });
      router.push(`/tienda/${storeId}`);
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
    // Simulación de la creación del producto (debes implementar la lógica real)
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

  const handleAddSocialMediaLink = () => {
    if (newSocialMedia.platform && newSocialMedia.link) {
      setSocialMediaLinks([...socialMediaLinks, { ...newSocialMedia }]);
      setNewSocialMedia({ platform: "", link: "" });
      setIsAddingSocialMedia(false);
    } else {
      toast.error("Por favor, selecciona una plataforma e ingresa el link.");
    }
  };

  const handleRemoveSocialMediaLink = (indexToRemove: number) => {
    setSocialMediaLinks(socialMediaLinks.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-6">Crear una tienda</h1>

      {user?.email === "german@team.nspsac.com" || user?.email === "carlosmerma99@gmail.com" ?  (
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

          <div className="mb-4">
            <Label className="block text-sm font-bold mb-2">
              Redes Sociales (Opcional)
            </Label>
            {socialMediaLinks.map((link, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input value={`${link.platform}: ${link.link}`} readOnly className="flex-1" />
                <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveSocialMediaLink(index)}>
                  Eliminar
                </Button>
              </div>
            ))}
            <Dialog open={isAddingSocialMedia} onOpenChange={setIsAddingSocialMedia}>
              <DialogTrigger asChild>
                <Button type="button" size="sm">
                  Añadir Red Social
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir Link de Red Social</DialogTitle>
                  <DialogDescription>
                    Selecciona la plataforma e ingresa el link.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="social-platform" className="text-right">
                      Plataforma
                    </Label>
                    <select
                      id="social-platform"
                      className="col-span-3 border rounded p-2"
                      value={newSocialMedia.platform}
                      onChange={(e) =>
                        setNewSocialMedia({ ...newSocialMedia, platform: e.target.value })
                      }
                    >
                      <option value="">Seleccionar</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">Tiktok</option>
                      {/* Añade más plataformas si es necesario */}
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="social-link" className="text-right">
                      Link
                    </Label>
                    <Input
                      id="social-link"
                      className="col-span-3"
                      type="url"
                      value={newSocialMedia.link}
                      onChange={(e) =>
                        setNewSocialMedia({ ...newSocialMedia, link: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsAddingSocialMedia(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSocialMediaLink}>Añadir</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

    </div>
  );
}