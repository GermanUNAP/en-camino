"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {  uploadProductImage } from "@/lib/storeService";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import Image from "next/image";

interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  images: File[];
  imagePreviews: string[];
}

export default function AddProductPage() {
  const { storeId } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    images: [],
    imagePreviews: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      const newPreviews: string[] = [];
      newImages.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newPreviews.push(reader.result as string);
            setFormData((prevFormData) => ({
              ...prevFormData,
              imagePreviews: [...prevFormData.imagePreviews, reader.result as string],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
      setFormData((prevFormData) => ({
        ...prevFormData,
        images: [...prevFormData.images, ...newImages],
      }));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      images: prevFormData.images.filter((_, index) => index !== indexToRemove),
      imagePreviews: prevFormData.imagePreviews.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    if (!storeId) {
      toast.error("El ID de la tienda no es válido.");
      setIsSubmitting(false);
      return;
    }
  
    try {
      const uploadPromises = formData.images.map(async (image) => {
        return await uploadProductImage(image, storeId as string);
      });
      const imageUrlsWithNull = await Promise.all(uploadPromises);
      const imageUrls: string[] = imageUrlsWithNull.filter(
        (url): url is string => url !== null
      );
  
      if (imageUrls.length !== formData.images.length) {
        toast.error("Error al subir algunas imágenes. Por favor, inténtalo de nuevo.");
        setIsSubmitting(false);
        return;
      }
  
      toast.success(`Producto "${formData.name}" añadido a la tienda.`);
      router.push(`/tienda/${storeId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al añadir producto:", error);
        toast.error(`No se pudo añadir el producto: ${error.message}`);
      } else {
        console.error("Error desconocido al añadir producto:", error);
        toast.error("No se pudo añadir el producto debido a un error desconocido.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Añadir Nuevo Producto</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        {/* ... el resto del formulario ... */}
        <div>
          <Label htmlFor="name">Nombre del Producto</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="images">Imágenes del Producto</Label>
          <Input
            type="file"
            id="images"
            name="images"
            multiple
            onChange={handleImageChange}
            accept="image/*"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">Puedes seleccionar varias imágenes.</p>
          {formData.imagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {formData.imagePreviews.map((previewUrl, index) => (
                <div key={index} className="relative rounded-md overflow-hidden">
                  <Image src={previewUrl} alt={`Vista previa ${index + 1}`} width={100} height={100} className="object-cover aspect-square" />
                  <Button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 -mt-2 -mr-2 h-6 w-6 rounded-full shadow-md bg-red-500 text-white flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting || formData.images.length === 0}>
          {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          Añadir Producto
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </form>
    </div>
  );
}