import { db, storage } from "@/lib/firebase";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  serverTimestamp,
  getDocs,
  query,
  limit,
  startAfter,
  where,
  QueryDocumentSnapshot,
  QueryConstraint,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { jsPDF } from "jspdf";
import * as QRCode from 'qrcode';

interface StoreData {
  userId: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  city?: string;
  category: string;
  coverImage?: string;
  socialMedia?: { platform: string; link: string }[];
}

interface ProductDataBase {
  name: string;
  description?: string;
  price: number;
  images: string[];
  isFeatured?: boolean;
}

interface ProductData extends ProductDataBase {
  storeId: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  images: string[]; 
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  city?: string;
  address?: string;
  phone?: string;
  coverImage?: string;
  products?: Product[]; // Include id in the product type within Store
  socialMedia?: SocialMediaLink[];
}

export interface SocialMediaLink {
  platform: string;
  link: string;
}

export const uploadStoreCoverImage = async (file: File, storeId: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `stores/${storeId}/cover/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: unknown) {
    console.error("Error uploading store cover image:", error);
    return null;
  }
};

export const createStore = async (storeData: StoreData): Promise<string> => {
  try {
    const storeId = uuidv4();
    const storeRef = doc(db, "stores", storeId);
    await setDoc(storeRef, {
      ...storeData,
      createdAt: serverTimestamp(),
    });
    return storeId;
  } catch (error: unknown) {
    console.error("Error creating store:", error);
    throw error;
  }
};

export const addProductToStore = async (productData: Omit<ProductData, 'storeId'>, storeId: string): Promise<string> => {
  try {
    const productsCollection = collection(db, "stores", storeId, "products");
    const docRef = await addDoc(productsCollection, {
      ...productData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: unknown) {
    console.error("Error adding product to store:", error);
    throw error;
  }
};

export const getStoreById = async (storeId: string): Promise<Store | null> => {
  try {
    const storeRef = doc(db, "stores", storeId);
    const storeSnap = await getDoc(storeRef);

    if (storeSnap.exists()) {
      const storeData = storeSnap.data() as Omit<Store, 'id' | 'products'>;
      const productsCollection = collection(db, "stores", storeId, "products");
      const productsSnap = await getDocs(productsCollection);
      const products = productsSnap.docs.map(doc => ({ id: doc.id, storeId: storeId, ...doc.data() } as ProductData & { id: string }));

      return {
        id: storeSnap.id,
        ...storeData,
        products,
      } as Store;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error: unknown) {
    console.error("Error getting store by ID:", error);
    throw error;
  }
};

const STORES_PER_PAGE = 6;

export const getPaginatedStores = async (lastVisible: QueryDocumentSnapshot | null): Promise<{ stores: Store[]; lastVisible: QueryDocumentSnapshot | null }> => {
  try {
    const storesCollection = collection(db, "stores");
    const constraints: QueryConstraint[] = [
      limit(STORES_PER_PAGE),
    ];

    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }

    const q = query(storesCollection, ...constraints);
    const snapshot = await getDocs(q);

    const stores: Store[] = [];
    let newLastVisible: QueryDocumentSnapshot | null = null;

    for (const doc of snapshot.docs) {
      const storeData = doc.data() as Omit<Store, 'id' | 'products'>;
      const productsCollection = collection(db, "stores", doc.id, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const products = productsSnapshot.docs.map(productDoc => ({ id: productDoc.id, storeId: doc.id, ...productDoc.data() } as ProductData & { id: string }));

      stores.push({
        id: doc.id,
        ...storeData,
        products,
      } as Store);
      newLastVisible = doc;
    }

    return { stores, lastVisible: newLastVisible };
  } catch (error: unknown) {
    console.error("Error getting paginated stores:", error);
    throw error;
  }
};

export const getStoresByCategory = async (categorySlug: string): Promise<Store[]> => {
  try {
    const storesCollection = collection(db, "stores");
    const q = query(storesCollection, where("category", "==", categorySlug));
    const snapshot = await getDocs(q);
    const stores: Store[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
    return stores;
  } catch (error: unknown) {
    console.error(`Error getting stores by category ${categorySlug}:`, error);
    throw error;
  }
};

export const getPaginatedStoresByCategory = async (categorySlug: string, lastVisible: QueryDocumentSnapshot | null): Promise<{ stores: Store[]; lastVisible: QueryDocumentSnapshot | null }> => {
  try {
    const storesCollection = collection(db, "stores");
    const constraints: QueryConstraint[] = [
      where("category", "==", categorySlug),
      limit(STORES_PER_PAGE),
    ];

    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }

    const q = query(storesCollection, ...constraints);
    const snapshot = await getDocs(q);

    const stores: Store[] = [];
    let newLastVisible: QueryDocumentSnapshot | null = null;

    if (!snapshot.empty) {
      for (const doc of snapshot.docs) {
        const storeData = doc.data() as Omit<Store, 'id' | 'products'>;
        const productsCollection = collection(db, "stores", doc.id, "products");
        const productsSnapshot = await getDocs(productsCollection);
        const products = productsSnapshot.docs.map(productDoc => ({ id: productDoc.id, storeId: doc.id, ...productDoc.data() } as ProductData & { id: string }));

        stores.push({
          id: doc.id,
          ...storeData,
          products,
        } as Store);
        newLastVisible = doc;
      }
    }

    return { stores, lastVisible: newLastVisible };
  } catch (error: unknown) {
    console.error(`Error getting paginated stores by category ${categorySlug}:`, error);
    throw error;
  }
};

export const generateStoreQRImage = async (storeUrl: string): Promise<string> => {
  try {
    const largeSize = 1024;
    const qrDataUrl = await QRCode.toDataURL(storeUrl, {
      width: largeSize,
      margin: 2,
    });
    return qrDataUrl;
  } catch (error: unknown) {
    console.error("Error generating QR image:", error);
    throw error;
  }
};

export const generateStoreQRPDF = async (store: Store, storeUrl: string, logoUrl?: string): Promise<Blob> => {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5'
    });

    const margin = 10;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const halfWidth = pageWidth / 2;
    const borderRadius = 12;

    const fetchImageAsBase64 = async (url: string): Promise<string> => {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    let logoHeight = 88;
    let logoWidth = 88;
    //se vuelve a reasignar las variables por problemas de typesccript  
    logoHeight = 88;
    logoWidth = 88;
    if (logoUrl) {
      try {
        const logoBase64 = await fetchImageAsBase64(logoUrl);
        logoWidth = (logoHeight / pdf.getImageProperties(logoBase64).height) * pdf.getImageProperties(logoBase64).width;
        const logoX = (halfWidth - logoWidth) / 2;
        const logoY = (pageHeight - logoHeight) / 2;
        pdf.addImage(logoBase64, 'JPEG', logoX, logoY, logoWidth, logoHeight);
      } catch (error: unknown) {
        console.error("Error al convertir el logo a base64:", error);
      }
    }

    const qrSize = 70;
    const qrX = halfWidth + (halfWidth - qrSize) / 2;
    const qrY = margin;
    try {
      const qrDataUrl = await QRCode.toDataURL(storeUrl, { width: 1024, margin: 2 });
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    } catch (err: unknown) {
      console.error("Error generando el QR:", err);
      throw err;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    let infoY = margin + qrSize + 15;
    const centerText = (text: string, y: number) => {
      const textWidth = pdf.getTextWidth(text);
      pdf.text(text, halfWidth + (halfWidth - textWidth) / 2, y);
      return y + 7;
    };

    infoY = centerText(store.name, infoY);

    pdf.setFontSize(14);
    infoY = centerText(store.category || 'Categoría no especificada', infoY);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    if (store.address) {
      infoY = centerText(`Dirección: ${store.address}`, infoY);
    }

    if (store.phone) {
      const whatsappText = `WhatsApp: ${store.phone}`;
      pdf.setFont('helvetica', 'bold');
      const textWidth = pdf.getTextWidth(whatsappText);
      pdf.setFont('helvetica', 'normal');
      const padding = 4;
      const buttonHeight = 8;
      const buttonWidth = textWidth + 2 * padding;
      const buttonX = halfWidth + (halfWidth - buttonWidth) / 2;
      const buttonY = infoY + 8;
      const textX = buttonX + padding;
      const textY = buttonY - 6 + (buttonHeight / 2) + (pdf.getLineHeight() / 4);

      pdf.setFillColor(0, 128, 0);
      pdf.roundedRect(buttonX - padding, buttonY - (buttonHeight / 2) - padding, buttonWidth + 2 * padding, buttonHeight + 2 * padding, borderRadius, borderRadius, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(whatsappText, textX, textY);
      pdf.setFont('helvetica', 'normal');

      pdf.setTextColor(0, 0, 0);
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const footerText = 'Escanea el código QR para conocernos.';
    const footerWidth = pdf.getTextWidth(footerText);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - margin);

    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error: unknown) {
    console.error("Error generating QR PDF:", error);
    throw error;
  }
};

export const uploadProductImage = async (file: File, storeId: string): Promise<string | null> => {
  try {
    const productId = uuidv4(); // Generate a unique ID for the product image
    const storageRef = ref(storage, `stores/${storeId}/products/${productId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: unknown) {
    console.error("Error uploading product image:", error);
    return null;
  }
};

export const updateStore = async (storeId: string, storeData: Partial<StoreData>): Promise<boolean> => {
  try {
    const storeRef = doc(db, "stores", storeId);
    await updateDoc(storeRef, {
      ...storeData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error: unknown) {
    console.error("Error updating store:", error);
    throw error;
  }
};

export const deleteProduct = async (storeId: string, productId: string): Promise<boolean> => {
  try {
    const productRef = doc(db, "stores", storeId, "products", productId);
    const productSnap = await getDoc(productRef);
    const productData = productSnap.data() as { images?: string[] } | undefined;

    // Delete images from storage
    if (productData?.images && productData.images.length > 0) {
      await Promise.all(
        productData.images.map(async (imageUrl) => {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
            console.log(`Deleted image: ${imageUrl}`);
          } catch (storageError: unknown) {
            console.error(`Error deleting image ${imageUrl}:`, storageError);
            // Optionally continue even if some deletions fail
          }
        })
      );
    }

    await deleteDoc(productRef);
    return true;
  } catch (error: unknown) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getPaginatedStoresByCriteria = async (
  storeSearchTerm?: string,
  productSearchTerm?: string,
  categorySlug?: string,
  citySlug?: string,
  lastVisible?: QueryDocumentSnapshot | null
): Promise<{ stores: Store[]; lastVisible: QueryDocumentSnapshot | null }> => {
  try {
    const storesCollection = collection(db, "stores");

    const baseConstraints: QueryConstraint[] = [
      orderBy("createdAt", "desc"),
      limit(STORES_PER_PAGE),
    ];

    if (lastVisible) {
      baseConstraints.push(startAfter(lastVisible));
    }

    const filterConstraints: QueryConstraint[] = [];

    if (categorySlug) {
      filterConstraints.push(where("category", "==", categorySlug));
    }

    if (citySlug && citySlug.trim() !== "") {
      const cityFilter = citySlug.toLowerCase();

      filterConstraints.push(where("city", "==", cityFilter));
    }

    const q = query(storesCollection, ...filterConstraints, ...baseConstraints);

    const snapshot = await getDocs(q);

    let newLastVisible: QueryDocumentSnapshot | null = null;
    const matchingStores: Store[] = [];

    for (const doc of snapshot.docs) {
      const storeData = doc.data() as Omit<Store, "id" | "products">;

      const productsCollection = collection(db, "stores", doc.id, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const products = productsSnapshot.docs.map(productDoc => ({
        id: productDoc.id,
        storeId: doc.id,
        ...productDoc.data(),
      } as ProductData & { id: string }));

      const store: Store = {
        id: doc.id,
        ...storeData,
        products,
        city: storeData.city ?? undefined,
      };

      // Normalizamos términos de búsqueda para comparar
      const normalizedStoreTerm = storeSearchTerm?.toLowerCase() ?? "";
      const normalizedProductTerm = productSearchTerm?.toLowerCase() ?? "";

      const matchesStore =
        !storeSearchTerm ||
        store.name.toLowerCase().includes(normalizedStoreTerm) ||
        (store.description?.toLowerCase().includes(normalizedStoreTerm) ?? false);

      const matchesProduct =
        !productSearchTerm ||
        products.some(product =>
          product.name.toLowerCase().includes(normalizedProductTerm) ||
          (product.description?.toLowerCase().includes(normalizedProductTerm) ?? false)
        );

      // Solo agregamos la tienda si cumple con los términos de búsqueda (store y producto)
      if (matchesStore && matchesProduct) {
        matchingStores.push(store);
      }

      newLastVisible = doc;
    }

    return { stores: matchingStores, lastVisible: newLastVisible };
  } catch (error: unknown) {
    console.error("Error getting paginated stores by criteria:", error);
    throw error;
  }
};
