"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { getStoreById, generateStoreQRImage, generateStoreQRPDF } from "@/lib/storeService";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ProductCard } from "../../../../components/product-card";
import { Loader2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase";
import Link from "next/link";
import { Edit, Download } from "lucide-react";

export interface SocialMediaLink {
  platform: string;
  link: string;
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  phone?: string;
  coverImage?: string;
  products?: any[];
  socialMedia?: SocialMediaLink[]; // Asegúrate de que tu tipo Store incluya esto
}

// Mapeo de plataformas a colores
const socialMediaConfig: { [key: string]: { color: string } } = {
  facebook: { color: "#1877F2" },
  twitter: { color: "#1DA1F2" },
  instagram: { color: "#E4405F" },
  youtube: { color: "#FF0000" },
  linkedin: { color: "#0A66C2" },
  whatsapp: { color: "#25D366" },
  tiktok: { color: "#000000" },
  // Añade más plataformas y sus configuraciones si es necesario
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
  const authorizedUserEmail = ["german@team.nspsac.com", "carlosmerma99@gmail.com"] ;

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
      } catch (e: any) {
        setError(`Error al cargar la tienda: ${e.message}`);
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
      alert("El número de WhatsApp no está disponible para esta tienda.");
    }
  };

  const handleDownloadQRImage = async () => {
    try {
      const qrDataUrl = await generateStoreQRImage(storeUrl);
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `qr_${store?.name || 'tienda'}.png`;
      link.click();
    } catch (error) {
      console.error("Error descargando QR:", error);
      alert("Ocurrió un error al generar el código QR");
    }
  };

  const handleDownloadQRPdf = async () => {
    if (!store) return;

    try {
      const pdfBlob = await generateStoreQRPDF(store, storeUrl, 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/fe161a44cc54d6ac763eefc1b9670b74~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=9af8c19c&x-expires=1746543600&x-signature=b8akAJDoOVeWpR6bS9r%2FGlK2KAc%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva');

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
      alert("Ocurrió un error al generar el PDF");
    }
  };

  if (loadingStore || loadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (!store) {
    return <div className="text-center py-4">No se pudo cargar la información de la tienda.</div>;
  }

  const isAuthorized = user?.email ? authorizedUserEmail.includes(user.email) : false;

  return (
    <div className="container mx-auto py-4">
      {store.coverImage ? (
        <div className="flex flex-col lg:flex-row items-start gap-4 mb-6">
          {/* Imagen portada */}
          <div className="relative w-full lg:w-1/2 aspect-[15/8] rounded-md overflow-hidden">
            <Image
              src={store.coverImage}
              alt={`Portada de ${store.name}`}
              fill
              className="object-cover"
              onError={(e) => {
                console.error("Error loading image:", e);
              }}
            />
          </div>

          <div className="w-full lg:w-1/2 flex flex-col items-center gap-4">
            <div className="bg-gray-50 rounded-md p-4 shadow w-full">
              <h2 className="text-xl font-semibold text-foreground mb-2">{store.name}</h2>
              {store.description && <p className="text-muted-foreground mb-2">{store.description}</p>}
              {store.address && <p className="text-sm text-muted-foreground mb-2">Dirección: {store.address}</p>}
              {store.phone && (
                <Button variant="outline" onClick={handleWhatsAppClick} className="mt-2 w-full text-white bg-green-600">
                  Contactar por WhatsApp
                </Button>
              )}

              {/* Sección de Redes Sociales */}
              {store.socialMedia && store.socialMedia.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-foreground mb-2">Redes Sociales</h3>
                  <div className="flex flex-wrap gap-2">
                    {store.socialMedia.map((social, index) => {
                      const config = socialMediaConfig[social.platform.toLowerCase()];
                      if (config) {
                        return (
                          <Link key={index} href={social.link} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="sm"
                              style={{ backgroundColor: config.color, color: "white" }}
                              className="flex items-center gap-2 hover:opacity-90"
                            >
                              {social.platform}
                            </Button>
                          </Link>
                        );
                      }
                      return (
                        <Link key={index} href={social.link} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="secondary">
                            {social.platform}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-md p-4 shadow flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center w-full">
                <div id="store-qr" className="rounded mb-4">
                  <QRCodeCanvas value={storeUrl} size={224} ref={qrCanvasRef} />
                </div>
                {loadingAuth ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                ) : isAuthorized ? (
                  <div className="flex gap-2 w-full justify-center">
                    <Link href={`/tienda/${storeId}/add-product`} className="w-1/2">
                      <Button size="sm" className="w-full">
                        Añadir Producto
                      </Button>
                    </Link>
                    <Link href={`/tienda/${storeId}/edit`} className="w-1/2">
                      <Button size="sm" className="w-full flex items-center justify-center gap-1">
                        Editar Tienda <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2 mt-4 justify-center w-full">
                <Button
                  variant="link"
                  onClick={handleDownloadQRImage}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> PNG
                </Button>
                <Button
                  variant="link"
                  onClick={handleDownloadQRPdf}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-start gap-4 mb-6">
          <div className="bg-gray-100 rounded-md h-64 w-full lg:w-1/2 flex items-center justify-center">
            <span className="text-gray-500">Sin imagen de portada</span>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-center gap-4">
            <div className="bg-gray-50 rounded-md p-4 shadow w-full">
              <h2 className="text-xl font-semibold text-foreground mb-2">{store.name}</h2>
              {store.description && <p className="text-muted-foreground mb-2">{store.description}</p>}
              {store.address && <p className="text-sm text-muted-foreground mb-2">Dirección: {store.address}</p>}
              {store.phone && (
                <Button variant="outline" onClick={handleWhatsAppClick} className="mt-2 w-full text-white bg-green-600">
                  Contactar por WhatsApp
                </Button>
              )}

              {/* Sección de Redes Sociales */}
              {store.socialMedia && store.socialMedia.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold text-foreground mb-2">Redes Sociales</h3>
                  <div className="flex flex-wrap gap-2">
                    {store.socialMedia.map((social, index) => {
                      const config = socialMediaConfig[social.platform.toLowerCase()];
                      if (config) {
                        return (
                          <Link key={index} href={social.link} target="_blank" rel="noopener noreferrer">
                            <Button
                              size="sm"
                              style={{ backgroundColor: config.color, color: "white" }}
                              className="flex items-center gap-2 hover:opacity-90"
                            >
                              {social.platform}
                            </Button>
                          </Link>
                        );
                      }
                      // Si la plataforma no está configurada, muestra un botón genérico
                      return (
                        <Link key={index} href={social.link} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="secondary">
                            {social.platform}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-md p-4 shadow flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center w-full">
                <div id="store-qr" className="rounded mb-4">
                  <QRCodeCanvas value={storeUrl} size={256} ref={qrCanvasRef} />
                </div>
                {loadingAuth ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin h-6 w-6" />
                  </div>
                ) : isAuthorized ? (
                  <div className="flex gap-2 w-full justify-center">
                    <Link href={`/tienda/${storeId}/add-product`} className="w-1/2">
                      <Button size="sm" className="w-full flex items-center justify-center gap-1">
                        Añadir Producto
                      </Button>
                    </Link>
                    <Link href={`/tienda/${storeId}/edit`} className="w-1/2">
                      <Button size="sm" className="w-full flex items-center justify-center gap-1">
                        Editar Tienda <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2 mt-4 justify-center w-full">
                <Button
                  variant="link"
                  onClick={handleDownloadQRImage}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> PNG
                </Button>
                <Button
                  variant="link"
                  onClick={handleDownloadQRPdf}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Download className="h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {store?.products && store.products.length > 0 ? (
        <div className="bg-white rounded-md shadow-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Productos ofrecidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {store.products.map((product) => (
              <ProductCard key={product.id} product={product} storeId={storeId as string} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow-md p-6">
          <p className="text-muted-foreground">Esta tienda aún no tiene productos disponibles.</p>
        </div>
      )}
    </div>
  );
}