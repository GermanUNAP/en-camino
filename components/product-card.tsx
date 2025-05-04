import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[]; 
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '/assets/images/placeholder.png'; 

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{product.name}</h3>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative w-full h-32 rounded-md overflow-hidden mb-2">
          <Image
            src={imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/placeholder.png'; 
            }}
          />
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
        )}
        <p className="text-primary font-semibold">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="flex justify-end p-4">
        <Button size="sm">Ver detalles</Button>
      </CardFooter>
    </Card>
  );
};