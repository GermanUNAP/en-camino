import React, { useState, useEffect, useRef } from 'react';
 import Image from 'next/image';
 import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
 import Link from 'next/link';

 interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | null | undefined;
  images: string[];
 }

 interface ProductCardProps {
  product: Product;
  storeId: string; // Añade storeId a las props
 }

 export const ProductCard: React.FC<ProductCardProps> = ({ product, storeId }) => { // Recibe storeId como prop
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const next = () => {
   if (product.images && carouselRef.current) {
    const newIndex = (currentIndex + 1) % product.images.length;
    setCurrentIndex(newIndex);
    carouselRef.current.scrollLeft = carouselRef.current.offsetWidth * newIndex;
   }
  };

  const prev = () => {
   if (product.images && carouselRef.current) {
    const newIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    setCurrentIndex(newIndex);
    carouselRef.current.scrollLeft = carouselRef.current.offsetWidth * newIndex;
   }
  };

  useEffect(() => {
   if (product.images && carouselRef.current) {
    carouselRef.current.scrollLeft = carouselRef.current.offsetWidth * currentIndex;
   }
  }, [currentIndex, product.images]);

  return (
   <Card>
    <CardHeader>
     <h3 className="text-lg font-semibold">{product.name}</h3>
    </CardHeader>
    <CardContent className="p-4">
     {product.images && product.images.length > 0 ? (
      <div className="relative">
       <div
        ref={carouselRef}
        className="w-full h-32 rounded-md overflow-x-scroll scroll-smooth snap-x snap-mandatory mb-2 flex"
       >
        {product.images.map((imageUrl, index) => (
         <div
          key={index}
          className="relative w-full h-32 shrink-0 snap-start"
         >
          <Image
           src={imageUrl}
           alt={`${product.name} - Imagen ${index + 1}`}
           layout="fill"
           objectFit="cover"
           className="rounded-md"
           onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/images/placeholder.png';
           }}
          />
         </div>
        ))}
       </div>
       {product.images.length > 1 && (
        <>
         <button
          onClick={prev}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full shadow-md p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
         >
          <ChevronLeftIcon className="w-5 h-5" />
         </button>
         <button
          onClick={next}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full shadow-md p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
         >
          <ChevronRightIcon className="w-5 h-5" />
         </button>
         <div className="absolute bottom-2 left-0 w-full flex items-center justify-center gap-1">
          {product.images.map((_, index) => (
           <button
            key={index}
            className={cn(
             "w-2 h-2 rounded-full transition-colors focus:outline-none",
             currentIndex === index ? "bg-white" : "bg-gray-300 hover:bg-gray-400"
            )}
            onClick={() => {
             if (carouselRef.current) {
              setCurrentIndex(index);
              carouselRef.current.scrollLeft = carouselRef.current.offsetWidth * index;
             }
            }}
            aria-label={`Ir a la imagen ${index + 1}`}
           />
          ))}
         </div>
        </>
       )}
      </div>
     ) : (
      <div className="relative w-full h-32 rounded-md overflow-hidden mb-2">
       <Image
        src="/assets/images/placeholder.png"
        alt={product.name}
        layout="fill"
        objectFit="cover"
        className="rounded-md"
       />
      </div>
     )}

     {product.description && (
      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
     )}
     <p className="text-primary font-semibold">
      {product.price ? `S/. ${product.price}` : 'Precio no disponible'}
     </p>
    </CardContent>
    <CardFooter className="flex justify-end p-4">
     <Link href={`/tienda/${storeId}/${product.id}`} passHref>
      <Button asChild size="sm">
       <a>Ver detalles</a>
      </Button>
     </Link>
    </CardFooter>
   </Card>
  );
 };