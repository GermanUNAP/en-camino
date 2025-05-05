"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaginatedStores, Store } from "@/lib/storeService";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => (
  <div className="bg-white rounded-md shadow-md p-4">
    <Link href={`/tienda/${store.id}`} className="block">
      <div className="relative w-full h-32 rounded-md overflow-hidden mb-2">
        {store.coverImage ? (
          <Image
            src={store.coverImage}
            alt={`Portada de ${store.name}`}
            layout="fill"
            objectFit="cover"
            onError={(e) => console.error("Error loading image:", e)}
          />
        ) : (
          <div className="bg-gray-100 w-full h-full flex items-center justify-center">
            <span className="text-gray-500 text-sm">Sin imagen</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{store.name}</h3>
      {store.description && <p className="text-sm text-muted-foreground truncate">{store.description}</p>}
      <p className="text-sm text-muted-foreground">Categoría: {store.category}</p>
    </Link>
  </div>
);

export default function TiendasPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchStores = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const { stores: newStores, lastVisible: newLastVisible } = await getPaginatedStores(lastVisible as QueryDocumentSnapshot);
      setStores((prevStores) => [...prevStores, ...newStores]);
      setLastVisible(newLastVisible);

      if (newStores.length < 6) {
        setHasMore(false);
      }
    } catch (e: any) {
      setError(`Error al cargar las tiendas: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, lastVisible]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const loadMore = useCallback(() => {
    fetchStores();
  }, [fetchStores]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Todas las Tiendas</h1>

      {stores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        !loading && <p className="text-center text-muted-foreground">No hay tiendas creadas aún.</p>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={loadMore} disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Cargar más"}
          </Button>
        </div>
      )}

      {error && <div className="text-center text-red-500 py-4">{error}</div>}
    </div>
  );
}