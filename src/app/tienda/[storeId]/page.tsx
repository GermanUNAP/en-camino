"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getStoreById, generateStoreQRPDF } from "@/lib/storeService";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ProductCard } from "../../../../components/product-card";
import { Loader2, Edit, Download, Star, Tag } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Store } from "@/lib/interfaces";

const socialMediaConfig: { [key: string]: { color: string } } = {
  facebook: { color: "#1877F2" },
  twitter: { color: "#1DA1F2" },
  instagram: { color: "#E4405F" },
  youtube: { color: "#FF0000" },
  linkedin: { color: "#0A66C2" },
  whatsapp: { color: "#25D366" },
  tiktok: { color: "#000000" },
};

export default function StoreViewPage() {
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const storeUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoadingAuth(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoadingStore(true);
        setError(null);
        const fetchedStore = await getStoreById(storeId as string);
        if (fetchedStore) {
          setStore(fetchedStore);
        } else {
          setError("Tienda no encontrada.");
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(`Error al cargar la tienda: ${e.message}`);
        } else {
          setError("Error desconocido al cargar la tienda.");
        }
      } finally {
        setLoadingStore(false);
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  const handleWhatsAppClick = () => {
    if (store?.phone) {
      window.open(`https://wa.me/${store.phone}`, "_blank");
    } else {
      console.error("El número de WhatsApp no está disponible para esta tienda.");
    }
  };

  const handleDownloadQRImage = async () => {
    if (qrCanvasRef.current) {
      const qrDataUrl = qrCanvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `qr_${store?.name || 'tienda'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error("No se pudo generar el código QR para descargar. Canvas no disponible.");
    }
  };

  const handleDownloadQRPdf = async () => {
    if (!store) return;

    try {
      const pdfBlob = await generateStoreQRPDF(store, storeUrl, 'https://placehold.co/100x100/A020F0/ffffff?text=Logo');

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${store.name}_info_qr.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando PDF:", error);
      console.error("Ocurrió un error al generar el PDF");
    }
  };

  if (loadingStore || loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (!store) {
    return <div className="text-center py-4 text-gray-700">No se pudo cargar la información de la tienda.</div>;
  }

  const isStoreOwner = user?.uid === store.userId;

  const storeImages = store.storeImages ?? []
  const hasStoreImages = storeImages.length > 0;
  const starRating = store.stars || 0;
  const ratingsCount = store.views || 0;
  const displayedTags = (store.tags || []).slice(0, 5);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
      <div className="flex flex-col items-center gap-6 mb-8">
        <div className="relative w-full max-w-4xl h-72 sm:h-96 md:h-[450px] rounded-lg overflow-hidden shadow-md bg-gray-100">
          {hasStoreImages ? (
            <Carousel className="w-full h-full">
                <CarouselContent>
                  {storeImages.map((url, index) => (
                    <CarouselItem key={index} className="relative w-full h-48 sm:h-56 md:h-64">
                      <Image
                        src={url}
                        alt={`Imagen ${index + 1} de ${store.name}`}
                        fill
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          console.error("Error loading image:", e);
                        }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
              </Carousel>
          ) : store.coverImage ? (
            <Image
              src={store.coverImage}
              alt={`Portada de ${store.name}`}
              fill
              className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                console.error("Error loading cover image:", e);
                e.currentTarget.src = "https://placehold.co/600x400/cccccc/333333?text=Error+Loading+Image";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
              <span>Sin imágenes de la tienda</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{store.name}</h1>
          {store.description && <p className="text-gray-700 text-lg mb-4 leading-relaxed">{store.description}</p>}

          <div className="flex items-center justify-center mb-3 text-gray-600">
            <span className="font-semibold mr-1">Categoría:</span> {store.category}
          </div>
          {store.address && (
            <p className="text-base text-gray-600 mb-3">
              <span className="font-semibold">Dirección:</span> {store.address}
            </p>
          )}
          {store.city && (
            <p className="text-base text-gray-600 mb-4">
              <span className="font-semibold">Ciudad:</span> {store.city}
            </p>
          )}

          <div className="flex items-center justify-center mb-4">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i < starRating ? "currentColor" : "none"}
                  stroke="currentColor"
                  className="mx-0.5"
                />
              ))}
            </div>
            <span className="text-base text-gray-600 ml-2">
              ({ratingsCount} {ratingsCount === 1 ? 'calificación' : 'calificaciones'})
            </span>
          </div>

          {store.phone && (
            <Button
              onClick={handleWhatsAppClick}
              className="mt-4 w-full sm:w-auto px-8 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-colors duration-200"
            >
              Contactar por WhatsApp
            </Button>
          )}

          {store.socialMedia && store.socialMedia.length > 0 && (
            <div className="mt-6 border-t pt-4 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Nuestras Redes Sociales</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {store.socialMedia.map((social, index) => {
                  const config = socialMediaConfig[social.platform.toLowerCase()];
                  if (config) {
                    return (
                      <Link
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline"
                        legacyBehavior
                      >
                        <Button
                          size="lg"
                          style={{ backgroundColor: config.color, color: "white" }}
                          className="flex items-center gap-2 px-5 py-2 hover:opacity-90 transition-opacity duration-200 rounded-lg shadow-sm"
                        >
                          {social.platform}
                        </Button>
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline"
                      legacyBehavior
                    >
                      <Button size="lg" variant="secondary" className="px-5 py-2 rounded-lg shadow-sm">
                        {social.platform}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {displayedTags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center text-gray-700 text-lg font-semibold mb-3">
                <Tag size={20} className="mr-2" /> Tags:
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {displayedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-black text-gray-700 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'none' }}>
            <QRCodeCanvas value={storeUrl} size={512} level="H" ref={qrCanvasRef} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t border-gray-200 justify-center">
            <Button
              onClick={handleDownloadQRImage}
              className="flex items-center gap-2 px-6 py-3 text-base bg-black hover:bg-gray-700 text-white rounded-lg shadow-md"
            >
              <Download className="h-5 w-5" /> Descargar QR (PNG)
            </Button>
            <Button
              onClick={handleDownloadQRPdf}
              className="flex items-center gap-2 px-6 py-3 text-base bg-black hover:bg-gray-700 text-white rounded-lg shadow-md"
            >
              <Download className="h-5 w-5" /> Descargar QR (PDF)
            </Button>
          </div>

          {loadingAuth ? (
            <div className="flex justify-center items-center mt-6">
              <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
            </div>
          ) : isStoreOwner ? (
            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t border-gray-200 justify-center">
              <Link href={`/tienda/${storeId}/add-product`} className="w-full sm:w-auto no-underline" legacyBehavior>
                <Button className="w-full sm:w-fit px-4 py-2 text-sm flex items-center justify-center gap-2 bg-black hover:bg-gray-700 text-white rounded-md shadow-md transition-colors duration-200">
                  Añadir Producto
                </Button>
              </Link>
              <Link href={`/tienda/${storeId}/edit`} className="w-full sm:w-auto no-underline" legacyBehavior>
                <Button className="w-full sm:w-fit px-4 py-2 text-sm flex items-center justify-center gap-2 bg-black hover:bg-gray-700 text-white rounded-md shadow-md transition-colors duration-200">
                  Editar Tienda <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {store?.products && store.products.length > 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Productos disponibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {store.products.map((product) => (
              <ProductCard key={product.id} product={product} storeId={storeId as string} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8 text-center">
          <p className="text-gray-600 text-lg">Esta tienda aún no tiene productos disponibles.</p>
        </div>
      )}
    </div>
  );
}