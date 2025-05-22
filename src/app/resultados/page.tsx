"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaginatedStoresByCriteria, Store } from "@/lib/storeService"; // función actualizada que acepta dos términos de búsqueda
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { QueryDocumentSnapshot } from "firebase/firestore";
import { STORE_CATEGORIES } from "@/lib/constants";

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
      {store.city && <p className="text-sm text-muted-foreground">Ciudad: {store.city}</p>}
    </Link>
  </div>
);

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  // Aquí recogemos los dos términos separados de búsqueda
  const searchTermTiendas = searchParams.get("tienda");
  const searchTermProductos = searchParams.get("producto");
  const categoriaSlug = searchParams.get("categoria");
  const ciudadSlug = searchParams.get("ciudad");

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchInfo, setSearchInfo] = useState<string>("");

  const fetchStores = useCallback(
    async (isInitial = false) => {
      if (loading || (!hasMore && !isInitial)) return;

      try {
        setLoading(true);
        setError(null);

        const { stores: newStores, lastVisible: newLastVisible } =
          await getPaginatedStoresByCriteria(
            searchTermTiendas || undefined,
            searchTermProductos || undefined,
            categoriaSlug || undefined,
            ciudadSlug || undefined,
            isInitial ? null : lastVisible
          );

        setStores((prev) => (isInitial ? newStores : [...prev, ...newStores]));
        setLastVisible(newLastVisible);
        setHasMore(newStores.length === 6);

        // Construimos la info de búsqueda visible
        let infoParts: string[] = [];
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
    },
    [searchTermTiendas, searchTermProductos, categoriaSlug, ciudadSlug, loading, hasMore, lastVisible]
  );

  useEffect(() => {
    setStores([]);
    setLastVisible(null);
    setHasMore(true);
    setError(null);
    fetchStores(true);
  }, [searchTermTiendas, searchTermProductos, categoriaSlug, ciudadSlug]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchStores(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-6">
        Resultados de la búsqueda
      </h1>

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
