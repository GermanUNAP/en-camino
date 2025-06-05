"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Store } from '@/lib/interfaces';
import { Star, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const starRating = store.stars || 0;
  const ratingsCount = store.views || 0; 


  const displayedTags = (store.tags || []).slice(0, 5); 
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <Link href={`/tienda/${store.id}`} className="block h-full">
        <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-t-lg overflow-hidden">
          {store.coverImage ? (
            <Image
              src={store.coverImage}
              alt={`Portada de ${store.name}`}
              fill
              className="object-contain w-full h-full"
              onError={(e) => {
                console.error("Error loading image:", e);
              }}
            />
          ) : (
            <div className="bg-gray-100 w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">Sin imagen</span>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow"> 
          <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">{store.name}</h3>
          {store.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{store.description}</p>
          )}
          <p className="text-xs text-gray-500 mb-1">
            <span className="font-semibold">Categoría:</span> {store.category}
          </p>
          {store.city && (
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-semibold">Ciudad:</span> {store.city}
            </p>
          )}

          <div className="flex items-center mb-3">
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < starRating ? "currentColor" : "none"}
                  stroke="currentColor"
                  className="mr-0.5"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              ({ratingsCount} {ratingsCount === 1 ? 'calificación' : 'calificaciones'})
            </span>
          </div>

          {displayedTags.length > 0 && (
            <div className="mt-auto pt-3 border-t border-gray-100"> 
              <div className="flex items-center text-gray-700 text-sm font-semibold mb-2">
                <Tag size={16} className="mr-1" /> Tags:
              </div>
              <div className="flex flex-wrap gap-2">
                {displayedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default StoreCard;