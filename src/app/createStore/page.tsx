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
import dynamic from 'next/dynamic';
import React from 'react'; 

// Define the expected props for MapComponent
interface MapComponentProps {
  lat: number | undefined;
  lng: number | undefined;
  setLocation: (lat: number, lng: number) => void;
}

const MapWithNoSSR = dynamic<MapComponentProps>( 
  () => import('../../../components/MapComponent'), 
  { ssr: false }
);

interface StoreData {
  userId: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  city?: string; // Consider if you need this field, it's not used in the form
  category: string;
  coverImages: string[];
  socialMedia?: { platform: string; link: string }[];
  tags: string[];
  latitude?: number;
  longitude?: number;
  stars: number;
  views: number;
  clicks: number;
  whatsappClicks: number;
  webClicks: number;
  productSells: number;
  followers: number;
  opinionsCount: number;
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
  const [selectedCoverImages, setSelectedCoverImages] = useState<File[]>([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMedia[]>([]);
  const [newSocialMedia, setNewSocialMedia] = useState<SocialMedia>({
    platform: "",
    link: "",
  });
  const [isAddingSocialMedia, setIsAddingSocialMedia] = useState(false);
  const [storeTags, setStoreTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isOnlineStore, setIsOnlineStore] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [paymentMethod, setPaymentMethod] = useState<"yape" | "card" | null>(null);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!storeName || !storeAddress || !storeCategory) {
        toast.error("Por favor, completa los campos obligatorios del Paso 1.");
        return;
      }
      if (storePhone && !/^(9\d{8})$/.test(storePhone)) {
        toast.error("El número de WhatsApp debe tener 9 dígitos y empezar con 9 (ej: 9XXXXXXXX).");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const goToStep = (step: number) => {
    // Allow going back to previous steps, but not forward if validation fails for the current step.
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === currentStep) {
      // Do nothing if trying to go to the current step
    } else {
      // Prevent skipping steps if validation fails for the current step
      if (currentStep === 1) {
        if (!storeName || !storeAddress || !storeCategory) {
          toast.error("Por favor, completa los campos obligatorios del Paso 1 antes de avanzar.");
          return;
        }
        if (storePhone && !/^(9\d{8})$/.test(storePhone)) {
          toast.error("El número de WhatsApp debe tener 9 dígitos y empezar con 9 (ej: 9XXXXXXXX).");
          return;
        }
      }
      setCurrentStep(step);
    }
  };

  const handleSkipLocationStep = () => {
    setIsOnlineStore(true);
    setLatitude(undefined);
    setLongitude(undefined);
    handleNextStep();
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) {
      toast.error("Usuario no autenticado. Por favor, inicia sesión.");
      return;
    }

    if (!paymentMethod) {
      toast.error("Por favor, selecciona un método de pago.");
      return;
    }

    toast.info(`Procesando pago con ${paymentMethod === 'yape' ? 'Yape' : 'Tarjeta de Crédito'}...`);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Pago procesado con éxito.");

    setIsSubmittingStore(true);
    toast.loading("Creando tu tienda...", { id: "create-store" });

    try {
      const coverImageUrls: string[] = [];
      for (const imageFile of selectedCoverImages) {
        const uploadResult = await uploadStoreCoverImage(imageFile, uuidv4());
        if (uploadResult) {
          coverImageUrls.push(uploadResult);
        } else {
          toast.error(`Error al subir la imagen: ${imageFile.name}`, { id: "create-store" });
          setIsSubmittingStore(false);
          return;
        }
      }

      const storeData: StoreData = {
        userId: user.uid,
        name: storeName,
        description: storeDescription,
        address: storeAddress,
        phone: storePhone,
        category: storeCategory,
        coverImages: coverImageUrls,
        socialMedia: socialMediaLinks.length > 0 ? socialMediaLinks : undefined,
        tags: storeTags,
        latitude: latitude,
        longitude: longitude,
        stars: 0,
        views: 0,
        clicks: 0,
        whatsappClicks: 0,
        webClicks: 0,
        productSells: 0,
        followers: 0,
        opinionsCount: 0,
      };

      const storeId = await createStore(storeData);
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

  const handleCoverImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedCoverImages((prevImages) => [...prevImages, ...filesArray]);
    }
  };

  const handleRemoveSelectedImage = (indexToRemove: number) => {
    setSelectedCoverImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
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

  const handleAddTag = () => {
    if (newTag.trim() === "") {
      toast.error("La etiqueta no puede estar vacía.");
      return;
    }
    const wordsInTag = newTag.trim().split(/\s+/).length;
    if (wordsInTag > 10) {
      toast.error("Cada etiqueta no puede exceder las 10 palabras.");
      return;
    }
    if (storeTags.length >= 10) {
      toast.error("Solo puedes agregar un máximo de 10 etiquetas.");
      return;
    }
    if (storeTags.includes(newTag.trim())) {
      toast.error("Esta etiqueta ya ha sido añadida.");
      return;
    }
    setStoreTags([...storeTags, newTag.trim()]);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setStoreTags(storeTags.filter(tag => tag !== tagToRemove));
  };

  const updateLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Crear una nueva tienda</h1>

      {user ? (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-xl">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => goToStep(step)}
                className={`flex-1 text-center py-2 border-b-2 transition-colors duration-200
                  ${currentStep >= step
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-400"
                  }
                  ${step > currentStep ? "cursor-not-allowed" : "cursor-pointer"}
                `}
                disabled={step > currentStep}
              >
                Paso {step}
              </button>
            ))}
          </div>

          <form onSubmit={handleCreateStore}>
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">1. Información Básica de la Tienda</h2>
                <div className="mb-4">
                  <Label htmlFor="name" className="pb-1 block text-sm font-medium text-gray-700">Nombre de la Tienda</Label>
                  <Input
                    id="name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="description" className="pb-1 block text-sm font-medium text-gray-700">Descripción (Opcional)</Label>
                  <Textarea
                    id="description"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="address" className="pb-1 block text-sm font-medium text-gray-700">Dirección</Label>
                  <Input
                    id="address"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="phone" className="pb-1 block text-sm font-medium text-gray-700">Número de WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="Ej: 912345678"
                    maxLength={9}
                    pattern="9\d{8}"
                    title="El número debe tener 9 dígitos y empezar con 9."
                  />
                  {storePhone && !/^(9\d{8})$/.test(storePhone) && (
                    <p className="text-red-500 text-xs mt-1">Formato inválido. Debe ser un número de 9 dígitos que empiece con 9.</p>
                  )}
                </div>

                <div className="mb-4">
                  <Label htmlFor="category" className="pb-1 block text-sm font-medium text-gray-700">Categoría</Label>
                  <select
                    id="category"
                    className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
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
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">2. Redes Sociales y Etiquetas</h2>
                <div className="mb-4">
                  <Label className="pb-1 block text-sm font-medium text-gray-700">Redes Sociales (Opcional)</Label>
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
                      <select
                        className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newSocialMedia.platform}
                        onChange={(e) => setNewSocialMedia({ ...newSocialMedia, platform: e.target.value })}
                        required
                      >
                        <option value="">Selecciona una plataforma</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="YouTube">YouTube</option>
                      </select>
                      <Input
                        placeholder="Link completo de la red social"
                        value={newSocialMedia.link}
                        onChange={(e) =>
                          setNewSocialMedia({ ...newSocialMedia, link: e.target.value })
                        }
                        required
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
                      className="mt-2 w-full"
                      onClick={() => setIsAddingSocialMedia(true)}
                    >
                      Añadir Red Social
                    </Button>
                  )}
                </div>

                <div className="mb-4">
                  <Label htmlFor="tags" className="pb-1 block text-sm font-medium text-gray-700">Etiquetas (palabras clave para la búsqueda, máximo 10)</Label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      id="tags"
                      placeholder="Ej. comida rápida, ropa de mujer"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} disabled={storeTags.length >= 10}>
                      Agregar Etiqueta
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {storeTags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">3. Ubicación de la Tienda (Opcional)</h2>
                <p className="text-gray-600 mb-4">
                  Si tu tienda tiene una ubicación física, haz clic en el mapa para establecer un pin. Puedes moverlo para ajustar la posición.
                </p>
                <div className="mb-4 flex items-center">
                  <Input
                    id="isOnlineStore"
                    type="checkbox"
                    checked={isOnlineStore}
                    onChange={(e) => setIsOnlineStore(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <Label htmlFor="isOnlineStore" className="text-sm font-medium text-gray-700">
                    Mi tienda es solo online (no tiene ubicación física)
                  </Label>
                </div>

                {!isOnlineStore && (
                  <div className="w-full h-80 rounded-md overflow-hidden border border-gray-300 mb-4">
                    <MapWithNoSSR
                      lat={latitude}
                      lng={longitude}
                      setLocation={updateLocation}
                    />
                  </div>
                )}

                {latitude !== undefined && longitude !== undefined && !isOnlineStore && (
                  <p className="text-sm text-gray-600">
                    Coordenadas seleccionadas: Latitud: {latitude?.toFixed(5)}, Longitud: {longitude?.toFixed(5)}
                  </p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkipLocationStep}
                  className="w-full mt-4"
                >
                  Saltar este paso (Tienda online)
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">4. Imágenes de Portada</h2>
                <div className="mb-4">
                  <Label htmlFor="coverImages" className="pb-1 block text-sm font-medium text-gray-700">
                    Imágenes de Portada (Múltiples, preferiblemente horizontales)
                  </Label>
                  <Input
                    id="coverImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCoverImagesChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">Sugerencia: Usa imágenes con orientación horizontal para una mejor visualización en los cards.</p>
                  {selectedCoverImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedCoverImages.map((file, index) => (
                        <div key={index} className="relative w-full h-24 rounded-md overflow-hidden shadow-md">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Thumbnail ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 p-1 h-auto text-xs bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleRemoveSelectedImage(index)}
                          >
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">5. Resumen y Pago</h2>

                <div className="bg-gray-50 p-4 rounded-md mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Datos de tu Tienda:</h3>
                  <p className="mb-1"><strong className="text-gray-700">Nombre:</strong> {storeName}</p>
                  {storeDescription && <p className="mb-1"><strong className="text-gray-700">Descripción:</strong> {storeDescription}</p>}
                  <p className="mb-1"><strong className="text-gray-700">Dirección:</strong> {storeAddress}</p>
                  {storePhone && <p className="mb-1"><strong className="text-gray-700">WhatsApp:</strong> {storePhone}</p>}
                  <p className="mb-1"><strong className="text-gray-700">Categoría:</strong> {storeCategory}</p>

                  {socialMediaLinks.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <strong className="text-gray-700">Redes Sociales:</strong>
                      <ul className="list-disc list-inside ml-4 text-sm mt-1">
                        {socialMediaLinks.map((link, index) => (
                          <li key={index}>{link.platform}: <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{link.link}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {storeTags.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <strong className="text-gray-700">Etiquetas:</strong>
                      <span className="ml-2 text-sm">{storeTags.join(", ")}</span>
                    </div>
                  )}

                  {isOnlineStore ? (
                    <p className="mt-3 border-t pt-3"><strong className="text-gray-700">Ubicación:</strong> Tienda online (sin ubicación física)</p>
                  ) : (latitude !== undefined && longitude !== undefined) ? (
                    <p className="mt-3 border-t pt-3">
                      <strong className="text-gray-700">Ubicación:</strong> Latitud: {latitude?.toFixed(5)}, Longitud: {longitude?.toFixed(5)}
                    </p>
                  ) : (
                    <p className="mt-3 border-t pt-3"><strong className="text-gray-700">Ubicación:</strong> No especificada (o pendiente de seleccionar)</p>
                  )}

                  {selectedCoverImages.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <strong className="text-gray-700">Imágenes de Portada:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCoverImages.map((file, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt={`Thumbnail ${index}`}
                            className="w-20 h-20 object-cover rounded-md shadow-sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="mt-3 border-t pt-3"><strong className="text-gray-700">Opiniones recibidas:</strong> 0</p>
                </div>

                <div className="mb-4">
                  <Label className="pb-1 block text-lg font-bold text-gray-800">Selecciona un Método de Pago</Label>
                  <p className="text-sm text-gray-600 mb-3">La creación de la tienda tiene un costo de [Costo del Servicio].</p>
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant={paymentMethod === 'yape' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('yape')}
                      className="flex-1 py-3 text-base"
                    >
                      Pagar con Yape
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('card')}
                      className="flex-1 py-3 text-base"
                    >
                      Pagar con Tarjeta de Crédito
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t">
              {currentStep > 1 && (
                <Button type="button" onClick={handlePrevStep} variant="outline">
                  Anterior
                </Button>
              )}
              {currentStep < totalSteps && (
                <Button type="button" onClick={handleNextStep} className="ml-auto">
                  Siguiente
                </Button>
              )}
              {currentStep === totalSteps && (
                <Button type="submit" disabled={isSubmittingStore || !paymentMethod} className="ml-auto">
                  {isSubmittingStore ? "Creando tienda..." : "Confirmar y Crear Tienda"}
                </Button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <p className="text-center text-lg text-red-600 mt-8">Inicie sesión para poder crear una tienda.</p>
      )}
    </div>
  );
}