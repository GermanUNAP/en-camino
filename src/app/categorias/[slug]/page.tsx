"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaginatedStoresByCategory, Store } from "@/lib/storeService";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { QueryDocumentSnapshot } from "firebase/firestore";

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
      {store.description && (
        <p className="text-sm text-muted-foreground truncate">{store.description}</p>
      )}
      <p className="text-sm text-muted-foreground">Categoría: {store.category}</p>
    </Link>
  </div>
);

export default function CategoryStoresPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  const fetchStores = useCallback(async (isInitial = false) => {
    if (!slug || (loading || (!hasMore && !isInitial))) return;

    try {
      setLoading(true);
      setError(null);

      const { stores: newStores, lastVisible: newLastVisible } =
        await getPaginatedStoresByCategory(slug, isInitial ? null : lastVisible);

      setStores((prev) => (isInitial ? newStores : [...prev, ...newStores]));
      setLastVisible(newLastVisible);
      setHasMore(newStores.length === 6);
      setCategoryName(slug);
    } catch (e) {
      let message = "Ocurrió un error al cargar las tiendas.";
      if (e instanceof Error) message = e.message;
      setError(message);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [slug, loading, hasMore, lastVisible]); // Añadida 'fetchStores' como dependencia

  useEffect(() => {
    setStores([]);
    setLastVisible(null);
    setHasMore(true);
    setError(null);
    fetchStores(true);
  }, [slug, fetchStores]); // Añadida 'fetchStores' como dependencia

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchStores(false); // Cargar más
    }
  }, [fetchStores, loading, hasMore]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        {categoryName
          ? `Tiendas en la categoría: ${categoryName}`
          : `Tiendas en la categoría: ${slug}`}
      </h1>

      {loading && stores.length === 0 ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="animate-spin h-10 w-10 mr-2" />
          Cargando tiendas...
        </div>
      ) : stores.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button onClick={loadMore} disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  "Cargar más"
                )}
              </Button>
            </div>
          )}
        </>
      ) : !error ? (
        <p className="text-center text-muted-foreground">No hay tiendas en esta categoría.</p>
      ) : (
        <p className="text-center text-red-500 py-4">{error}</p>
      )}

      {error && <div className="text-center text-red-500 py-4">{error}</div>}
    </div>
  );
}