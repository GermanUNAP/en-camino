import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { app } from "./firebase";


const db = getFirestore(app);

const auth = getAuth(app);
const firestore = getFirestore(app);
const provider = new GoogleAuthProvider();

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (data: any) => {
  const {
    email,
    password,
    displayName,
    telefono,
    direccion,
    fechaNacimiento,
    genero,
  } = data;

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(cred.user, {
    displayName,
    photoURL: "", // opcional
  });

  await setDoc(doc(firestore, "usuarios", cred.user.uid), {
    uid: cred.user.uid,
    email,
    displayName,
    telefono,
    direccion,
    fechaNacimiento,
    genero,
    createdAt: serverTimestamp(),
  });

  return cred.user;
};

// Tipo para los campos adicionales
interface ExtraFields {
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  genero?: string;
}

// Actualiza el perfil del usuario
export const updateUserProfile = async (
  displayName: string,
  photoFile: File | null,
  extraFields: ExtraFields = {}
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  let photoURL = user.photoURL;

  if (photoFile) {
    const storage = getStorage();
    const storageRef = ref(storage, `profile-images/${user.uid}`);
    await uploadBytes(storageRef, photoFile);
    photoURL = await getDownloadURL(storageRef);
  }

  await updateProfile(user, { displayName, photoURL });

  await setDoc(
    doc(firestore, "usuarios", user.uid),
    {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL,
      ...extraFields,
    },
    { merge: true }
  );

  return {
    displayName,
    photoURL,
    email: user.email,
    ...extraFields,
  };
};

export const getUserProfileFromFirestore = async (uid: string) => {
  const docRef = doc(db, "usuarios", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
      return docSnap.data();
  } else {
      throw new Error("Perfil no encontrado en Firestore.");
  }
};
