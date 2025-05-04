"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getStoreById } from "@/lib/storeService";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ProductCard } from "../../../../components/product-card";
import { Loader2 } from "lucide-react";

interface Store {
  id: string;
  name: string;
  category: string;
  userId: string;
  description?: string;
  address?: string;
  phone?: string | null;
  coverImage?: string | null;
  products?: any[];
}

export default function StoreViewPage() {
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  if (loading) {
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

  const handleWhatsAppClick = () => {
    if (store.phone) {
      window.open(`https://wa.me/${store.phone}`, "_blank");
    } else {
      alert("El número de WhatsApp no está disponible para esta tienda.");
    }
  };

  return (
    <div className="container mx-auto py-4">
      {store.coverImage ? (
        <div className="relative w-full h-64 rounded-md overflow-hidden mb-6">
          <Image
            src={store.coverImage}
            alt={`Portada de ${store.name}`}
            layout="fill"
            objectFit="cover"
            onError={(e) => {
              console.error("Error loading image:", e);
            }}
          />
        </div>
      ) : (
        <div className="bg-gray-100 rounded-md h-64 flex items-center justify-center mb-6">
          <span className="text-gray-500">Sin imagen de portada</span>
        </div>
      )}

      <div className="bg-white rounded-md shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">{store.name}</h1>
        {store.description && <p className="text-muted-foreground mb-4">{store.description}</p>}
        {store.address && <p className="text-sm text-muted-foreground mb-2">Dirección: {store.address}</p>}
        {store.phone && (
          <Button variant="outline" onClick={handleWhatsAppClick} className="mt-2">
            Contactar por WhatsApp
          </Button>
        )}
      </div>

      {store.products && store.products.length > 0 ? (
        <div className="bg-white rounded-md shadow-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Productos ofrecidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {store.products.map((product) => (
              <ProductCard key={product.id} product={product} />
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