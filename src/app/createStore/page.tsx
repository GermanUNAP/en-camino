"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { app } from "@/lib/firebase";
import {
  Payment,
  PlanDefinition,
  PlanTypeEnum,
  SocialMediaLink,
  Store,
  SubscriptionPlan,
} from "@/lib/interfaces";
import { createStore, uploadStoreCoverImage } from "@/lib/storeService";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { 
  collection,
  getDocs,
  getFirestore,
  query,
  where } from "firebase/firestore";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface MapComponentProps {
  lat: number | undefined;
  lng: number | undefined;
  setLocation: (lat: number, lng: number) => void;
}

const MapWithNoSSR = dynamic<MapComponentProps>(
  () => import('../../../components/MapComponent'),
  { ssr: false }
);

export default function CreateStorePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeCategory, setStoreCategory] = useState("");
  const [selectedCoverImages, setSelectedCoverImages] = useState<File[]>([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([]);
  const [newSocialMedia, setNewSocialMedia] = useState<SocialMediaLink>({
    platform: "",
    link: "",
  });
  const [isAddingSocialMedia, setIsAddingSocialMedia] = useState(false);
  const [storeTags, setStoreTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>("");
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isOnlineStore, setIsOnlineStore] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  const totalSteps = 5;
  const [paymentMethod, setPaymentMethod] = useState<"yape" | "card" | null>(null);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanDefinition | null>(null);
  const [isIncubatorParticipant, setIsIncubatorParticipant] = useState(false);
  const [incubatorCode, setIncubatorCode] = useState("")
  const [validCode, setValidCode] = useState(false);

  const plans: PlanDefinition[] = useMemo(() => [
    {
      name: "Plan Freemium",
      weeklyCost: 6.00,
      description: ["Catálogo con imágenes", "Contacto por WhatsApp", "Acceso a comunidad", "Acompañamiento gratuito"],
      planType: PlanTypeEnum.FREEMIUM,
    },
    {
      name: "Plan Crece",
      weeklyCost: 18.00,
      description: ["Todo lo anterior +", "Catálogo con video", "Posicionamiento local", "Soporte personalizado"],
      planType: PlanTypeEnum.CRECE,
    },
    {
      name: "Plan Pro+",
      weeklyCost: 36.00,
      description: ["Todo lo anterior +", "Publicidad destacada", "Prioridad en búsquedas", "Estadísticas", "Asesoría mensual"],
      planType: PlanTypeEnum.PRO_PLUS,
    },
    {
      name: "Publicidad Empresarial",
      weeklyCost: 100.00,
      description: ["Para empresas que desean promocionar productos o a nivel nacional"],
      planType: PlanTypeEnum.EMPRESA,
    },
  ], []);

  const finalWeeklyCost = useMemo(() => {
    if (selectedPlan) {
      if (isIncubatorParticipant) {
        return selectedPlan.weeklyCost * 0.5;
      }
      return selectedPlan.weeklyCost;
    }
    return 0;
  }, [selectedPlan, isIncubatorParticipant]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!selectedPlan) {
        toast.error("Por favor, selecciona un plan de suscripción para continuar.");
        return;
      }
    } else if (currentStep === 1) {
      if (!storeName.trim() || !storeAddress.trim() || !storeCategory) {
        toast.error("Por favor, completa los campos obligatorios: Nombre, Dirección y Categoría.");
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
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === currentStep) {
      // Do nothing
    } else {
      if (currentStep === 1) {
        if (!storeName.trim() || !storeAddress.trim() || !storeCategory) {
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

    if (!selectedPlan) {
      toast.error("Por favor, selecciona un plan de suscripción.");
      return;
    }

    if (!paymentMethod) {
      toast.error("Por favor, selecciona un método de pago.");
      return;
    }

    toast.info(`Procesando pago con ${paymentMethod === 'yape' ? 'Yape' : 'Tarjeta de Crédito'} por S/ ${finalWeeklyCost.toFixed(2)}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Pago procesado con éxito.");

    setIsSubmittingStore(true);
    toast.loading("Creando tu tienda...", { id: "create-store" });

    try {
      const coverImageUrls: string[] = [];
      if (selectedCoverImages.length > 0) {
        for (const imageFile of selectedCoverImages) {
          const uploadResult = await uploadStoreCoverImage(imageFile, user.uid);
          if (uploadResult) {
            coverImageUrls.push(uploadResult);
          } else {
            toast.error(`Error al subir la imagen: ${imageFile.name}`, { id: "create-store" });
            setIsSubmittingStore(false);
            return;
          }
        }
      }

      const now = new Date();
      const startDate = now.toISOString();
      const endDate = new Date(now.setDate(now.getDate() + 7)).toISOString();

      const currentPlan: SubscriptionPlan = {
        planType: selectedPlan.planType,
        startDate: startDate,
        endDate: endDate,
        isActive: true,
      };

      const paymentRecord: Payment = {
        planType: selectedPlan.planType,
        amount: finalWeeklyCost,
        paymentDate: startDate,
        endDate: endDate,
        transactionId: `txn_${uuidv4()}`,
      };

      const storeData: Omit<Store, 'id' | 'products'> = {
        userId: user.uid,
        name: storeName,
        description: storeDescription.trim() || undefined,
        address: storeAddress.trim(),
        phone: storePhone.trim() || undefined,
        category: storeCategory,
        coverImage: coverImageUrls.length > 0 ? coverImageUrls[0] : undefined,
        storeImages: coverImageUrls,
        socialMedia: socialMediaLinks.length > 0 ? socialMediaLinks : undefined,
        tags: storeTags,
        latitude: latitude,
        longitude: longitude,
        stars: 0,
        views: 0,
        clicks: 0,
        whatsappClicks: 0,
        productSells: 0,
        followers: 0,
        opinionsCount: 0,
        webClicks: 0,
        currentPlan: currentPlan,
        paymentHistory: [paymentRecord],
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
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      const filteredFiles = filesArray.filter(file => 
        validImageTypes.includes(file.type)
      );

      if (filteredFiles.length !== filesArray.length) {
        toast.error("Solo se permiten archivos de imagen (JPEG, PNG, WEBP)");
      }

      if (filteredFiles.length > 0) {
        setSelectedCoverImages((prevImages) => [...prevImages, ...filteredFiles]);
      }
    }
  };

  const handleRemoveSelectedImage = (indexToRemove: number) => {
    setSelectedCoverImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleAddSocialMediaLink = () => {
    if (newSocialMedia.platform && newSocialMedia.link.trim()) {
      setSocialMediaLinks([...socialMediaLinks, { ...newSocialMedia, link: newSocialMedia.link.trim() }]);
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
    const trimmedTag = newTag.trim();
    const wordsInTag = trimmedTag.split(/\s+/).length;
    if (wordsInTag > 10) {
      toast.error("Cada etiqueta no puede exceder las 10 palabras.");
      return;
    }
    if (storeTags.length >= 10) {
      toast.error("Solo puedes agregar un máximo de 10 etiquetas.");
      return;
    }
    if (storeTags.includes(trimmedTag)) {
      toast.error("Esta etiqueta ya ha sido añadida.");
      return;
    }
    setStoreTags([...storeTags, trimmedTag]);
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setStoreTags(storeTags.filter(tag => tag !== tagToRemove));
  };

  const updateLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const validateCode = async (code: string): Promise<void> => {
    if (code.trim() === "") {
      toast("El código no es válido");
      setValidCode(false);
      return;
    }

    try {
      const db = getFirestore(app);
      const codigosRef = collection(db, "codigos");
      const q = query(
        codigosRef,
        where("code", "==", code),
        where("activationStatus", "==", false)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setValidCode(true);
      } else {
        toast("El código no existe o ya fue activado.");
        setValidCode(false);
      }
    } catch (error) {
      console.error("Error al validar el código:", error);
      toast("Ocurrió un error al validar el código.");
      setValidCode(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Crear una nueva tienda</h1>

      {user ? (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-xl">
          {currentStep === 0 ? (
            // Plan Selection View (Step 0)
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">Elige tu Plan de Suscripción</h2>
              <p className="text-gray-600 mb-4 text-center">
                Todos los planes pueden actualizarse o bajarse de nivel de forma manual en cualquier momento desde el perfil del usuario.
              </p>

              <div className="space-y-6 mb-8">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-6 border rounded-lg shadow-sm cursor-pointer transition-all duration-200
                      ${selectedPlan?.name === plan.name ? "border-dark-500 ring-2 ring-dark-300 bg-dark-50" : "border-gray-200 hover:border-gray-300"}
                    `}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{plan.name}</h3>
                    <p className="text-2xl font-extrabold text-dark-700 mb-3">S/ {plan.weeklyCost.toFixed(2)} <span className="text-base text-gray-500 font-normal">semanales</span></p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {plan.description.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mb-6 border-t pt-4">
                <div className="flex items-center">
                  <Input
                    id="isIncubatorParticipant"
                    type="checkbox"
                    checked={isIncubatorParticipant}
                    onChange={(e) => setIsIncubatorParticipant(e.target.checked)}
                    className="mr-2 h-4 w-4 text-dark-600 focus:ring-dark-500"
                  />
                  <Label htmlFor="isIncubatorParticipant" className="text-sm font-medium text-gray-700">
                    Participo en una incubadora, universidad o programa público de formación.
                  </Label>
                </div>
                {isIncubatorParticipant && selectedPlan && (
                  <div>
                    <div>
                      <Input 
                        id="incubadoraCode"
                        value={incubatorCode}
                        onChange={(e) => setIncubatorCode(e.target.value)}
                        required={isIncubatorParticipant}
                      />
                      <Button onClick={()=>validateCode(incubatorCode)} title="ValidarCódigo"/>
                    </div>
                    <p className="text-sm text-dark-600 mt-2">
                      ¡Felicidades! Se aplicará un **50% de descuento** al plan sugerido (S/ {finalWeeklyCost.toFixed(2)} semanales) durante las primeras 8 semanas.
                      <span className="block text-xs text-gray-500">
                        (La aplicación del descuento por las 8 semanas se gestionará en el sistema de facturación/renovación del plan).
                      </span>
                    </p>
                  </div> 
                  
                )}
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full py-3 text-lg bg-black hover:bg-black text-white"
                disabled={!selectedPlan || (isIncubatorParticipant && !validCode)}
              >
                Continuar con el Plan Seleccionado
              </Button>
            </div>
          ) : (
            // Store Creation Steps (Steps 1-5)
            <>
              <div className="flex justify-between mb-8">
                {[1, 2, 3, 4, 5].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => goToStep(step)}
                    className={`flex-1 text-center py-2 border-b-2 transition-colors duration-200
                      ${currentStep >= step
                        ? "border-dark-600 text-dark-600 font-semibold"
                        : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600"
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
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">1. Información Básica de la Tienda</h2>
                    <div className="mb-4">
                      <Label htmlFor="name" className="pb-1 block text-sm font-medium text-gray-700">Nombre de la Tienda</Label>
                      <Input
                        id="name"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        required
                        className="border-gray-300 focus:border-dark-500 focus:ring-dark-500"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="description" className="pb-1 block text-sm font-medium text-gray-700">Descripción (Opcional)</Label>
                      <Textarea
                        id="description"
                        value={storeDescription}
                        onChange={(e) => setStoreDescription(e.target.value)}
                        rows={3}
                        className="border-gray-300 focus:border-dark-500 focus:ring-dark-500"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="address" className="pb-1 block text-sm font-medium text-gray-700">Dirección</Label>
                      <Input
                        id="address"
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        required
                        className="border-gray-300 focus:border-dark-500 focus:ring-dark-500"
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="phone" className="pb-1 block text-sm font-medium text-gray-700">Número de WhatsApp (Opcional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="Ej: 912345678"
                        maxLength={9}
                        pattern="9\d{8}"
                        title="El número debe tener 9 dígitos y empezar con 9."
                        className="border-gray-300 focus:border-dark-500 focus:ring-dark-500"
                      />
                      {storePhone && !/^(9\d{8})$/.test(storePhone) && (
                        <p className="text-red-500 text-xs mt-1">Formato inválido. Debe ser un número de 9 dígitos que empiece con 9.</p>
                      )}
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="category" className="pb-1 block text-sm font-medium text-gray-700">Categoría</Label>
                      <select
                        id="category"
                        className="w-full border rounded p-2 focus:ring-dark-500 focus:border-dark-500 text-gray-700"
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
                        <option value="servicios">Servicios</option>
                        <option value="educacion">Educación</option>
                        <option value="belleza">Belleza y Cuidado Personal</option>
                        <option value="hogar">Hogar y Decoración</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">2. Redes Sociales y Etiquetas</h2>
                    <div className="mb-4">
                      <Label className="pb-1 block text-sm font-medium text-gray-700">Redes Sociales (Opcional)</Label>
                      {socialMediaLinks.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {socialMediaLinks.map((link, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <span className="flex-1 text-sm text-gray-700">{link.platform}: {link.link}</span>
                              <Button type="button" size="sm" variant="destructive" onClick={() => handleRemoveSocialMediaLink(index)} className="bg-red-500 hover:bg-red-600">
                                Quitar
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {isAddingSocialMedia ? (
                        <div className="flex flex-col space-y-2 mt-2 p-3 border rounded-md bg-gray-50">
                          <select
                            className="w-full border rounded p-2 focus:ring-dark-500 focus:border-dark-500 text-gray-700 text-sm"
                            value={newSocialMedia.platform}
                            onChange={(e) => setNewSocialMedia({ ...newSocialMedia, platform: e.target.value })}
                            required
                          >
                            <option value="">Selecciona una plataforma</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Instagram">Instagram</option>
                            <option value="TikTok">TikTok</option>
                            <option value="YouTube">YouTube</option>
                            <option value="LinkedIn">LinkedIn</option>
                          </select>
                          <Input
                            placeholder="Link completo (ej: https://facebook.com/tutienda)"
                            value={newSocialMedia.link}
                            onChange={(e) =>
                              setNewSocialMedia({ ...newSocialMedia, link: e.target.value })
                            }
                            required
                            className="border-gray-300 focus:border-black focus:ring-dark-500"
                          />
                          <div className="flex space-x-2">
                            <Button type="button" onClick={handleAddSocialMediaLink} className="flex-1 bg-black hover:bg-dark-700 text-white">
                              Añadir
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsAddingSocialMedia(false)} className="flex-1 border-gray-300 hover:bg-gray-100">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2 w-full border-gray-300 hover:bg-gray-100"
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
                          placeholder="Ej. comida rápida, ropa de mujer, artesanías"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="border-gray-300 focus:border-black focus:ring-dark-500"
                        />
                        <Button type="button" onClick={handleAddTag} disabled={storeTags.length >= 10 || newTag.trim() === ""} className="bg-black  text-white">
                          Agregar Etiqueta
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {storeTags.map((tag, index) => (
                          <span
                            key={index}
                            className="flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      {storeTags.length === 0 && <p className="text-xs text-gray-500 mt-1">Añade etiquetas relevantes para que tu tienda sea fácil de encontrar.</p>}
                      {storeTags.length >= 10 && <p className="text-red-500 text-xs mt-1">Has alcanzado el límite de 10 etiquetas.</p>}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">3. Ubicación de la Tienda (Opcional)</h2>
                    <p className="text-gray-600 mb-4">
                      Si tu tienda tiene una ubicación física, haz clic en el mapa para establecer un pin. Puedes moverlo para ajustar la posición.
                    </p>
                    <div className="mb-4 flex items-center">
                      <Input
                        id="isOnlineStore"
                        type="checkbox"
                        checked={isOnlineStore}
                        onChange={(e) => setIsOnlineStore(e.target.checked)}
                        className="mr-2 h-4 w-4 text-dark-600 focus:ring-dark-500"
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
                        Coordenadas seleccionadas: <span className="font-semibold">Latitud: {latitude?.toFixed(5)}, Longitud: {longitude?.toFixed(5)}</span>
                      </p>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSkipLocationStep}
                      className="w-full mt-4 border-gray-300 hover:bg-gray-100"
                    >
                      Saltar este paso (Tienda online)
                    </Button>
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">4. Imágenes de Portada</h2>
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
                        className="file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 file:border-none file:rounded-md file:px-3 file:py-1 hover:file:bg-gray-200"
                      />
                      <p className="text-sm text-gray-500 mt-1">Sugerencia: Usa imágenes con orientación horizontal para una mejor visualización en los cards.</p>
                      {selectedCoverImages.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {selectedCoverImages.map((file, index) => (
                            <div key={index} className="relative w-full h-24 rounded-md overflow-hidden shadow-md group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Thumbnail ${index}`}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="absolute top-1 right-1 p-1 h-auto text-xs bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveSelectedImage(index)}
                              >
                                X
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mt-2">No has seleccionado ninguna imagen de portada aún.</p>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700">5. Resumen y Pago</h2>

                    <div className="bg-gray-50 p-4 rounded-md mb-6 shadow-sm">
                      <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-gray-800">Datos de tu Tienda:</h3>
                      {selectedPlan && (
                        <p className="mb-1"><strong className="text-gray-700">Plan Seleccionado:</strong> {selectedPlan.name} (<span className="text-dark-700 font-bold">S/ {finalWeeklyCost.toFixed(2)} semanales</span>)</p>
                      )}
                      {isIncubatorParticipant && (
                        <p className="mb-1 text-dark-600 text-sm">Descuento de 50% aplicado para la primera semana.</p>
                      )}
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
                              <li key={index}>{link.platform}: <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-dark-600 hover:underline break-all">{link.link}</a></li>
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
                    </div>

                    <div className="mb-4">
                      <Label className="pb-1 block text-lg font-bold text-gray-800">Selecciona un Método de Pago</Label>
                      {selectedPlan && (
                        <p className="text-sm text-gray-600 mb-3">El costo de la primera semana para tu plan **{selectedPlan.name}** es de <span className="font-bold text-dark-700">S/ {finalWeeklyCost.toFixed(2)}</span>.</p>
                      )}
                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant={paymentMethod === 'yape' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('yape')}
                          className={`flex-1 py-3 text-base ${paymentMethod === 'yape' ? 'bg-dark-600 hover:bg-dark-700 text-white' : 'border-gray-300 hover:bg-gray-100'}`}
                        >
                          Pagar con Yape
                        </Button>
                        <Button
                          type="button"
                          variant={paymentMethod === 'card' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('card')}
                          className={`flex-1 py-3 text-base ${paymentMethod === 'card' ? 'bg-dark-600 hover:bg-dark-700 text-white' : 'border-gray-300 hover:bg-gray-100'}`}
                        >
                          Pagar con Tarjeta de Crédito
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                  {currentStep > 0 && (
                    <Button type="button" onClick={handlePrevStep} variant="outline" className="border-gray-300 hover:bg-gray-100 text-gray-700">
                      Anterior
                    </Button>
                  )}
                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={handleNextStep} className="ml-auto bg-black  text-white">
                      Siguiente
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmittingStore || !paymentMethod} className="ml-auto bg-black hover:bg-dark-700 text-white">
                      {isSubmittingStore ? "Creando tienda..." : "Confirmar y Crear Tienda"}
                    </Button> 
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      ) : (
        <p className="text-center text-lg text-red-600 mt-8">Inicie sesión para poder crear una tienda.</p>
      )}
    </div>
  );
}