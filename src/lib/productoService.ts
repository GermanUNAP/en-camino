// ./src/lib/productoService.ts
import { db } from "./firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp,
} from "firebase/firestore";

export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number | null | undefined;
  images: string[];
  storeId: string;
  createdAt?: Timestamp; 
}

export const getProductById = async (
  storeId: string,
  productId: string
): Promise<Product | null> => {
  try {
    const productRef = doc(db, "stores", storeId, "products", productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() } as Product;
    } else {
      console.log(
        `No se encontró el producto con ID ${productId} en la tienda ${storeId}.`
      );
      return null;
    }
  } catch (error: unknown) {
    console.error(
      `Error al obtener el producto con ID ${productId} en la tienda ${storeId}:`,
      error
    );
    throw error;
  }
};

export const getRelatedProducts = async (
  storeId: string,
  currentProductId: string,
  limit: number = 4
): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "stores", storeId, "products");
    const q = query(productsRef, where("id", "!=", currentProductId));
    const productsSnap = await getDocs(q);
    const products: Product[] = [];
    productsSnap.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    return products.slice(0, limit);
  } catch (error: unknown) {
    console.error(
      `Error al obtener productos relacionados para la tienda ${storeId}:`,
      error
    );
    throw error;
  }
};

export const updateProduct = async (
  storeId: string,
  productId: string,
  updatedData: Partial<Product>
): Promise<void> => {
  try {
    const productRef = doc(db, "stores", storeId, "products", productId);
    await updateDoc(productRef, updatedData);
    console.log(
      `Producto con ID ${productId} en la tienda ${storeId} actualizado exitosamente.`
    );
  } catch (error: unknown) {
    console.error(
      `Error al actualizar el producto con ID ${productId} en la tienda ${storeId}:`,
      error
    );
    throw error;
  }
};

export const deleteProduct = async (
  storeId: string,
  productId: string
): Promise<void> => {
  try {
    const productRef = doc(db, "stores", storeId, "products", productId);
    await deleteDoc(productRef);
    console.log(
      `Producto con ID ${productId} eliminado exitosamente de la tienda ${storeId}.`
    );
  } catch (error: unknown) {
    console.error(
      `Error al eliminar el producto con ID ${productId} de la tienda ${storeId}:`,
      error
    );
    throw error;
  }
};

export const getAllProductsByStore = async (
  storeId: string
): Promise<Product[]> => {
  try {
    const productsRef = collection(db, "stores", storeId, "products");
    const productsSnap = await getDocs(productsRef);
    const products: Product[] = [];
    productsSnap.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    return products;
  } catch (error: unknown) {
    console.error(
      `Error al obtener todos los productos de la tienda ${storeId}:`,
      error
    );
    throw error;
  }
};

async function getLatestProductsFromFirebase(limit = 8): Promise<Product[]> {
  try {
    const allProducts: Product[] = [];
    const storesSnapshot = await getDocs(collection(db, "stores"));

    for (const storeDoc of storesSnapshot.docs) {
      const productsRef = collection(db, "stores", storeDoc.id, "products");
      const q = query(productsRef, orderBy("createdAt", "desc"));
      const productsSnapshot = await getDocs(q);
      productsSnapshot.forEach((doc) => {
        allProducts.push({ ...doc.data(), id: doc.id, storeId: storeDoc.id } as Product);
      });
    }

    // Ordenar todos los productos por createdAt de forma descendente
    allProducts.sort((a, b) => {
      const dateA = a.createdAt?.toMillis() || 0;
      const dateB = b.createdAt?.toMillis() || 0;
      return dateB - dateA;
    });

    return allProducts.slice(0, limit);
  } catch (error: unknown) {
    console.error("Error al obtener los últimos productos:", error);
    return [];
  }
}

export { getLatestProductsFromFirebase };