// src/app/categorias/[slug]/page.tsx (Assuming this path)
"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaginatedStoresByCategory } from "@/lib/storeService";
import { Store } from "@/lib/interfaces";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { QueryDocumentSnapshot } from "firebase/firestore";
import StoreCard from "../../../../components/StoreCard";

export default function CategoryStoresPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  const fetchStores = useCallback(
    async (isInitial = false) => {
      if (!slug || loading || (!hasMore && !isInitial)) return;

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
        console.error("Error fetching stores:", e);
        setError(e instanceof Error ? e.message : "Error desconocido al cargar las tiendas.");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [slug, loading, hasMore, lastVisible]
  );

  useEffect(() => {
    if (slug) {
      setStores([]);
      setLastVisible(null);
      setHasMore(true);
      setError(null);
      fetchStores(true);
    }
  }, [slug, fetchStores]); 

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchStores(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center capitalize">
        {categoryName
          ? `Tiendas en la categoría: ${decodeURIComponent(categoryName).replace(/-/g, ' ')}`
          : "Cargando categoría..."}
      </h1>

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
        <p className="text-center text-gray-500 py-10 text-xl">
          No se encontraron tiendas en esta categoría.
        </p>
      )}
    </div>
  );
}