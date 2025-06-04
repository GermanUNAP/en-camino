"use client";

import { Button } from "@/components/ui/button";
import { Store } from "@/lib/interfaces";
import { getLatestProductsFromFirebase, Product } from "@/lib/productoService";
import { getPaginatedStores } from "@/lib/storeService";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchLatestStores = async () => {
      setLoadingStores(true);
      setErrorStores(null);
      try {
        const { stores } = await getPaginatedStores(null);
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
          Escanee para empezar
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