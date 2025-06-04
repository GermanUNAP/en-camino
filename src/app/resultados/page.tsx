"use client";

import { Button } from "@/components/ui/button";
import { STORE_CATEGORIES } from "@/lib/constants";
import { Store } from "@/lib/interfaces";
import { getPaginatedStoresByCriteria } from "@/lib/storeService";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import StoreCard from "../../../components/StoreCard";

function SearchResultsContent() {
  const searchParams = useSearchParams();

  const searchTermTiendas = useMemo(() => searchParams.get("tienda"), [searchParams]);
  const searchTermProductos = useMemo(() => searchParams.get("producto"), [searchParams]);
  const categoriaSlug = useMemo(() => searchParams.get("categoria"), [searchParams]);
  const ciudadSlug = useMemo(() => searchParams.get("ciudad"), [searchParams]);

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInfo, setSearchInfo] = useState<string>("");

  useEffect(() => {
    const fetchInitialStores = async () => {
      setLoading(true);
      setError(null);
      setStores([]);
      setLastVisible(null);
      setHasMore(true);

      try {
        const { stores: newStores, lastVisible: newLastVisible } =
          await getPaginatedStoresByCriteria(
            searchTermTiendas || undefined,
            searchTermProductos || undefined,
            categoriaSlug || undefined,
            ciudadSlug || undefined,
            null
          );

        setStores(newStores);
        setLastVisible(newLastVisible);
        setHasMore(newStores.length === 6);

        const infoParts: string[] = [];
        if (searchTermTiendas) infoParts.push(`Buscando en tiendas: "${searchTermTiendas}"`);
        if (searchTermProductos) infoParts.push(`Buscando en productos: "${searchTermProductos}"`);
        if (categoriaSlug) {
          const catName = STORE_CATEGORIES.find(cat => cat.slug === categoriaSlug)?.name || categoriaSlug;
          infoParts.push(`Categoría: ${catName}`);
        }
        if (ciudadSlug) infoParts.push(`Ciudad: ${ciudadSlug}`);

        setSearchInfo(infoParts.join(", "));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStores();
  }, [searchTermTiendas, searchTermProductos, categoriaSlug, ciudadSlug]);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const { stores: newStores, lastVisible: newLastVisible } =
        await getPaginatedStoresByCriteria(
          searchTermTiendas || undefined,
          searchTermProductos || undefined,
          categoriaSlug || undefined,
          ciudadSlug || undefined,
          lastVisible
        );

      setStores((prev) => [...prev, ...newStores]);
      setLastVisible(newLastVisible);
      setHasMore(newStores.length === 6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-xl font-bold mb-6">Resultados de la búsqueda</h1>

      {searchInfo && <p className="mb-4 text-muted-foreground">{searchInfo}</p>}

      {loading && stores.length === 0 ? (
        <div className="flex justify-center items-center py-6">
          <Loader2 className="animate-spin h-10 w-10 mr-2" />
          Cargando resultados...
        </div>
      ) : error ? (
        <p className="text-center text-red-500 py-4">{error}</p>
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
      ) : (
        <p className="text-center text-muted-foreground py-4">
          No se encontraron resultados con los criterios seleccionados.
        </p>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center py-6">
          <Loader2 className="animate-spin h-10 w-10 mr-2" />
          Cargando página...
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}