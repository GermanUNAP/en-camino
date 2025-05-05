// ./app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { getPaginatedStores, Store } from "@/lib/storeService";
import { getLatestProductsFromFirebase, Product } from "@/lib/productoService";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => (
  <div className="relative bg-white rounded-md shadow-md p-4 overflow-hidden">
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
    {/* Detalles sobre la tienda (puedes personalizarlos) */}
    <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold p-1 z-10">
      Destacado
    </div>
  </div>
);

interface SimpleProductCardProps {
  product: Product;
  storeId: string;
}

const SimpleProductCard: React.FC<SimpleProductCardProps> = ({
  product,
  storeId,
}) => (
  <div className="relative bg-white rounded-md shadow-md p-4 overflow-hidden">
    <Link href={`/tienda/${storeId}/producto/${product.id}`} className="block">
      <div className="relative w-full h-32 rounded-md overflow-hidden mb-2">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
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
      <h3 className="text-md font-semibold text-foreground mb-1 truncate">
        {product.name}
      </h3>
      <p className="text-sm text-muted-foreground">
        S/ {product.price}
      </p>
      {product.description && (
        <p className="text-xs text-muted-foreground truncate">
          {product.description}
        </p>
      )}
    </Link>
    {/* Detalles sobre el producto (puedes personalizarlos) */}
    <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground rounded-md text-xs font-semibold p-1 z-10">
      Oferta
    </div>
  </div>
);

export default function HomePage() {
  const [latestStores, setLatestStores] = useState<Store[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorStores, setErrorStores] = useState<string | null>(null);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestStores = async () => {
      setLoadingStores(true);
      setErrorStores(null);
      try {
        const { stores } = await getPaginatedStores();
        setLatestStores(stores);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErrorStores(`Error al cargar las últimas tiendas: ${e.message}`);
        } else {
          setErrorStores("Error desconocido al cargar las últimas tiendas.");
        }
      } finally {
        setLoadingStores(false);
      }
    };
  
    const fetchLatestProducts = async () => {
      setLoadingProducts(true);
      setErrorProducts(null);
      try {
        const products = await getLatestProductsFromFirebase();
        setLatestProducts(products);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setErrorProducts(`Error al cargar los últimos productos: ${e.message}`);
        } else {
          setErrorProducts("Error desconocido al cargar los últimos productos.");
        }
      } finally {
        setLoadingProducts(false);
      }
    };
  
    fetchLatestStores();
    fetchLatestProducts();
  }, []);
  

  return (
    <div className="bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-200 min-h-screen py-10">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          En Camino Puno
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Cada escaneo, una historia que transforma.
        </p>
        {/* <Button variant="outline" className="rounded-full px-8 py-3 font-semibold">
          Escanear para empezar
        </Button> */}

        {/* Tiendas Destacadas */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Negocios destacados
          </h2>
          {loadingStores ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
            </div>
          ) : errorStores ? (
            <p className="text-red-500">{errorStores}</p>
          ) : latestStores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {latestStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay tiendas destacadas por el momento.</p>
          )}
          {latestStores.length > 0 && (
            <div className="mt-4">
              <Link href="/tiendas">
                <Button variant="outline" className="rounded-full px-6 py-2 font-semibold text-gray-700 border-gray-400 hover:bg-gray-100">
                  Ver todas las tiendas
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Productos Destacados */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Productos Destacados
          </h2>
          {loadingProducts ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
            </div>
          ) : errorProducts ? (
            <p className="text-red-500">{errorProducts}</p>
          ) : latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <SimpleProductCard
                  key={product.id}
                  product={product}
                  storeId={product.storeId}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay productos destacados por el momento.</p>
          )}
          {latestProducts.length > 0 && (
            <div className="mt-4">
              {/* Puedes añadir un enlace para ver todos los productos si lo implementas */}
              {/* <Link href="/productos">
                <Button variant="outline" className="rounded-full px-6 py-2 font-semibold text-gray-700 border-gray-400 hover:bg-gray-100">
                  Ver todos los productos
                </Button>
              </Link> */}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}