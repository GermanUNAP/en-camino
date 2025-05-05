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
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';


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
        socialMedia: socialMediaLinks,
      });
      toast.success(`Tienda "${storeName}" creada correctamente`, { id: "create-store" });
      router.push(`/tienda/${storeId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Error al crear la tienda: ${error.message}`, { id: "create-store" });
      } else {
        toast.error("Error desconocido al crear la tienda.", { id: "create-store" });
      }
    } finally {
      setIsSubmittingStore(false);
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

      {user?.email === "german@team.nspsac.com" || user?.email === "carlosmerma99@gmail.com" ? (
        <form
          onSubmit={handleCreateStore}
          className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md"
        >
          <div className="mb-4">
            <Label htmlFor="name">Nombre de la Tienda</Label>
            <Input
              id="name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="phone">Teléfono (Opcional)</Label>
            <Input
              id="phone"
              type="tel"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="category">Categoría</Label>
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
            <Label htmlFor="coverImage">Imagen de Portada (Opcional)</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
            />
          </div>

          <div className="mb-4">
            <Label>Redes Sociales (Opcional)</Label>
            {socialMediaLinks.map((link, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input value={`${link.platform}: ${link.link}`} readOnly className="flex-1" />
                <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveSocialMediaLink(index)}>
                  Quitar
                </Button>
              </div>
            ))}
            {isAddingSocialMedia && (
              <div className="flex flex-col space-y-2 mt-2">
                <Input
                  placeholder="Plataforma (ej. Instagram)"
                  value={newSocialMedia.platform}
                  onChange={(e) =>
                    setNewSocialMedia({ ...newSocialMedia, platform: e.target.value })
                  }
                />
                <Input
                  placeholder="Link"
                  value={newSocialMedia.link}
                  onChange={(e) =>
                    setNewSocialMedia({ ...newSocialMedia, link: e.target.value })
                  }
                />
                <Button type="button" onClick={handleAddSocialMediaLink}>
                  Añadir
                </Button>
              </div>
            )}
            {!isAddingSocialMedia && (
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => setIsAddingSocialMedia(true)}
              >
                Añadir Red Social
              </Button>
            )}
          </div>

          <Button type="submit" disabled={isSubmittingStore}>
            {isSubmittingStore ? "Creando tienda..." : "Crear tienda"}
          </Button>
        </form>
      ) : (
        <p>No tienes permisos para crear una tienda.</p>
      )}
    </div>
  );
}
