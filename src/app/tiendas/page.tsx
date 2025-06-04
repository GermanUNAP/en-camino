// src/app/tiendas/page.tsx (assuming this is the file path)
"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaginatedStores } from "@/lib/storeService";
import { Store } from "@/lib/interfaces";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { QueryDocumentSnapshot } from "firebase/firestore";
import StoreCard from "../../../components/StoreCard";

export default function TiendasPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchStores = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad && (!hasMore || loading)) return;

    setLoading(true);
    setError(null);

    try {
      const { stores: newStores, lastVisible: newLastVisible } = await getPaginatedStores(
        isInitialLoad ? null : lastVisible
      );

      const uniqueNewStores = newStores.filter(newStore =>
        !stores.some(existingStore => existingStore.id === newStore.id)
      );

      setStores((prevStores) => (isInitialLoad ? uniqueNewStores : [...prevStores, ...uniqueNewStores]));
      setLastVisible(newLastVisible);

      setHasMore(newStores.length === 6); 
    } catch (e: unknown) {
      console.error("Error fetching stores:", e);
      if (e instanceof Error) {
        setError(`Error al cargar las tiendas: ${e.message}`);
      } else {
        setError("Error desconocido al cargar las tiendas.");
      }
      setHasMore(false); 
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, lastVisible, stores]); 

  useEffect(() => {
    fetchStores(true);
  }, [fetchStores]); 

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchStores();
    }
  }, [fetchStores, loading, hasMore]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Todas las Tiendas</h1>

      {loading && stores.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-12 w-12 text-primary mr-3" />
          <span className="text-lg text-gray-700">Cargando tiendas...</span>
        </div>
      ) : error ? (
        <p className="text-center text-red-600 py-10 text-lg">{error}</p>
      ) : stores.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <Button onClick={loadMore} disabled={loading} className="px-8 py-3 text-lg">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-3" />
                    Cargando...
                  </>
                ) : (
                  "Cargar más tiendas"
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 py-10 text-xl">
            No hay tiendas creadas aún. ¡Sé el primero en agregar una!
          </p>
        )
      )}
    </div>
  );
}