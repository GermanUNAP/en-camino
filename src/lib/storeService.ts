import { db, storage } from "./firebase";
import { doc, setDoc, collection, addDoc, getDoc, serverTimestamp, getDocs, query, limit, startAfter, where, QueryDocumentSnapshot, QueryConstraint } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

interface StoreData {
  userId: string;
  name: string;
  description?: string;
  address: string;
  phone?: string;
  category: string;
  coverImage?: string;
}

interface ProductData {
  storeId: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
}

export interface Store {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  phone?: string;
  coverImage?: string;
  products?: any[];
}

export const uploadStoreCoverImage = async (file: File, storeId: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `stores/${storeId}/cover/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading store cover image:", error.message);
    return null;
  }
};

export const createStore = async (storeData: StoreData) => {
  try {
    const storeId = uuidv4();
    const storeRef = doc(db, "stores", storeId);
    await setDoc(storeRef, {
      ...storeData,
      storeId,
      createdAt: serverTimestamp(),
    });
    return storeId;
  } catch (error: any) {
    console.error("Error creating store:", error.message);
    throw error;
  }
};

export const addProductToStore = async (productData: ProductData) => {
  try {
    const productsCollection = collection(db, "stores", productData.storeId, "products");
    const docRef = await addDoc(productsCollection, {
      ...productData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error("Error adding product to store:", error.message);
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
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return {
        id: storeSnap.id,
        ...storeData,
        products,
      } as Store;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error: any) {
    console.error("Error getting store by ID:", error.message);
    throw error;
  }
};

const STORES_PER_PAGE = 6;

export const getPaginatedStores = async (lastVisible?: QueryDocumentSnapshot): Promise<{ stores: Store[]; lastVisible: QueryDocumentSnapshot | null }> => {
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
      const products = productsSnapshot.docs.map(productDoc => ({ id: productDoc.id, ...productDoc.data() }));

      stores.push({
        id: doc.id,
        ...storeData,
        products,
      } as Store);
      newLastVisible = doc;
    }

    return { stores, lastVisible: newLastVisible };
  } catch (error: any) {
    console.error("Error getting paginated stores:", error.message);
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
  } catch (error: any) {
    console.error(`Error getting stores by category ${categorySlug}:`, error.message);
    throw error;
  }
};

export const getPaginatedStoresByCategory = async (categorySlug: string, lastVisible?: QueryDocumentSnapshot): Promise<{ stores: Store[]; lastVisible: QueryDocumentSnapshot | null }> => {
  try {
    const storesCollection = collection(db, "stores");
    const q = query(
      storesCollection,
      where("category", "==", categorySlug),
      limit(STORES_PER_PAGE),
      ...(lastVisible ? [startAfter(lastVisible)] : [])
    );
    const snapshot = await getDocs(q);

    const stores: Store[] = [];
    let newLastVisible: QueryDocumentSnapshot | null = null;

    for (const doc of snapshot.docs) {
      const storeData = doc.data() as Omit<Store, 'id' | 'products'>;
      const productsCollection = collection(db, "stores", doc.id, "products");
      const productsSnapshot = await getDocs(productsCollection);
      const products = productsSnapshot.docs.map(productDoc => ({ id: productDoc.id, ...productDoc.data() }));

      stores.push({
        id: doc.id,
        ...storeData,
        products,
      } as Store);
      newLastVisible = doc;
    }

    return { stores, lastVisible: newLastVisible };
  } catch (error: any) {
    console.error(`Error getting paginated stores for category ${categorySlug}:`, error.message);
    throw error;
  }
};