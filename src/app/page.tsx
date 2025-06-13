"use client";

import { Button } from "@/components/ui/button";
import { Store } from "@/lib/interfaces";
import { getLatestProductsFromFirebase, Product } from "@/lib/productoService";
import { getPaginatedStores } from "@/lib/storeService";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SimpleProductCard from "../../components/SimpleProductCard";
import StoreCard from "../../components/StoreCard";

interface SimpleProductCardProps {
  product: Product;
  storeId: string;
}

export default function HomePage() {
  const [latestStores, setLatestStores] = useState<Store[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorStores, setErrorStores] = useState<string | null>(null);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let offset = 0;

    const scroll = () => {
      if (!container) return;
      offset -= 0.5; // velocidad
      if (Math.abs(offset) >= container.scrollWidth / 2) {
        offset = 0;
      }
      container.style.transform = `translateX(${offset}px)`;
    };

    const interval = setInterval(scroll, 10);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLatestStores = async () => {
      setLoadingStores(true);
      setErrorStores(null);
      try {
        const { stores } = await getPaginatedStores(null);
        setLatestStores(stores);
      } catch (e: unknown) {
        setErrorStores(e instanceof Error
          ? `Error al cargar las últimas tiendas: ${e.message}`
          : "Error desconocido al cargar las últimas tiendas.");
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
        setErrorProducts(e instanceof Error
          ? `Error al cargar los últimos productos: ${e.message}`
          : "Error desconocido al cargar los últimos productos.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchLatestStores();
    fetchLatestProducts();
  }, []);

  const logos = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-200 min-h-screen py-10">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          En Camino Puno
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Cada escaneo, una historia que transforma.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Empresas aliadas
          </h2>
          <div className="relative w-full overflow-hidden">
            <div
              className="flex w-max gap-4 px-2 py-2 transition-transform duration-75 ease-linear"
              ref={scrollRef}
            >
              {[...logos, ...logos].map((i, index) => (
                <Link href={`/tienda/${i}`} key={index}>
                  <div className="w-[30vw] max-w-[150px] min-w-[100px] h-[60px] flex items-center justify-center bg-white shadow-sm rounded-md hover:scale-105 transition-transform cursor-pointer">
                    <img
                      src={`https://via.placeholder.com/80x40.png?text=Logo+${i}`}
                      alt={`Empresa ${i}`}
                      className="h-8 object-contain"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Tiendas destacadas */}
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

        {/* Productos destacados */}
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
              <Link href="/productos">
                <Button variant="outline" className="rounded-full px-6 py-2 font-semibold text-gray-700 border-gray-400 hover:bg-gray-100">
                  Ver todos los productos
                </Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
