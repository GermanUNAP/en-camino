"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  getProductById as fetchProductData,
  getRelatedProducts as fetchRelatedProducts,
} from '@/lib/productoService'; // Asegúrate de que la ruta sea correcta
import { Loader2 } from "lucide-react"; // Importa un icono de carga

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number | null | undefined;
  images: string[];
  storeId: string;
}

const ProductDetailPage = () => {
  const params = useParams();
  const { productId, storeId } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadProductDetails = async () => {
      if (productId && storeId) {
        setLoading(true);
        setError(null);
        try {
          const productData = await fetchProductData(storeId as string, productId as string);
          if (productData) {
            setProduct(productData);
            const related = await fetchRelatedProducts(
              productData.storeId,
              productData.id as string
            );
            setRelatedProducts(related);
          } else {
            setError('Producto no encontrado.');
          }
        } catch (e: any) {
          setError('Error al cargar el producto.');
        } finally {
          setLoading(false);
        }
      } else if (!storeId) {
        setError('ID de la tienda no proporcionado en la URL.');
        setLoading(false);
      } else if (!productId) {
        setError('ID del producto no proporcionado en la URL.');
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [productId, storeId]);

  const next = () => {
    if (product?.images && carouselRef.current) {
      const newIndex = (currentIndex + 1) % product.images.length;
      setCurrentIndex(newIndex);
      carouselRef.current.scrollLeft = carouselRef.current.offsetWidth * newIndex;
    }
  };

  const prev = () => {
    if (product?.images && carouselRef.current) {
      const newIndex = (currentIndex - 1 + product.images.length) % product.images.length;
      setCurrentIndex(newIndex);
      carouselRef.current.scrollLeft = carouselRef.current.offsetWidth * newIndex;
    }
  };

  useEffect(() => {
    if (product?.images && carouselRef.current) {
      carouselRef.current.scrollLeft = carouselRef.current.offsetWidth * currentIndex;
    }
  }, [currentIndex, product?.images]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Producto no encontrado.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Información del Producto (Lado Izquierdo en pantallas grandes) */}
      <div className="order-2 lg:order-1">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{product.name}</h3>
          </CardHeader>
          <CardContent className="p-4">
            {product.description && (
              <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
            )}
            <p className="text-primary font-semibold text-xl mb-4">
              {`S/. ${product.price}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Carousel de Imágenes (Lado Derecho en pantallas grandes) */}
      <div className="order-1 lg:order-2">
        {product.images && product.images.length > 0 ? (
          <div className="relative aspect-[1920/1024] w-full rounded-md overflow-hidden">
            <div
              ref={carouselRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory absolute inset-0"
            >
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-full h-full snap-start shrink-0"
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              ))}
            </div>
            {product.images.length > 1 && (
              <>
                <Button
                  onClick={prev}
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  onClick={next}
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="relative w-full h-48 rounded-md overflow-hidden">
            <Image
              src="/assets/images/placeholder.png"
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-8 col-span-full">
          <h2 className="text-lg font-semibold mb-4">Productos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id}>
                <CardHeader>
                  <h3 className="text-sm font-semibold truncate">{relatedProduct.name}</h3>
                </CardHeader>
                <CardContent className="p-2">
                  {relatedProduct.images && relatedProduct.images.length > 0 ? (
                    <div className="relative w-full h-24 rounded-md overflow-hidden mb-2">
                      <Image
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-24 rounded-md overflow-hidden mb-2">
                      <Image
                        src="/assets/images/placeholder.png"
                        alt={relatedProduct.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {relatedProduct.description}
                  </p>
                  <p className="text-primary font-semibold text-sm">
                    {typeof relatedProduct.price === 'number'
                      ? `S/. ${(relatedProduct.price * 3.7).toFixed(2)}`
                      : 'Precio no disp.'}
                  </p>
                </CardContent>
                <CardFooter className="p-2 flex justify-end">
                  <Button size="sm">Ver</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;