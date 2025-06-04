// ./components/SimpleProductCard.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/productoService"; // Ensure this path is correct

interface SimpleProductCardProps {
  product: Product;
  storeId: string; // The storeId is needed for the product link
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
      <p className="text-sm text-muted-foreground">S/ {product.price}</p>
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

export default SimpleProductCard;