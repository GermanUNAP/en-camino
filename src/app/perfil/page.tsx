"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { updateUserProfile, getUserProfileFromFirestore } from "@/lib/authService";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { Camera } from "lucide-react";

interface UserProfileData {
  displayName: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  genero: string;
  photoURL?: string | null;
  email?: string | null;
}

interface InputFieldProps {
  label: string;
  value: string | number | readonly string[] | undefined;
  onChange: (newValue: string) => void;
  key: string;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: "email" | "search" | "tel" | "text" | "url" | "numeric" | "none" | "decimal" | undefined;
}

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [originalData, setOriginalData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasChanges = useCallback(() => {
    if (!originalData) return false;
    return (
      displayName !== originalData?.displayName ||
      telefono !== originalData?.telefono ||
      direccion !== originalData?.direccion ||
      fechaNacimiento !== originalData?.fechaNacimiento ||
      genero !== originalData?.genero ||
      photoFile !== null
    );
  }, [displayName, telefono, direccion, fechaNacimiento, genero, photoFile, originalData]);

  const validateAll = () => {
    const errors: Record<string, string> = {};
    const phoneRegex = /^[0-9]{9}$/;
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;

    if (!nameRegex.test(displayName)) errors.displayName = "Nombre inválido.";
    if (!phoneRegex.test(telefono)) errors.telefono = "Teléfono inválido. Debe tener 9 dígitos.";
    if (!fechaNacimiento) errors.fechaNacimiento = "Debes seleccionar una fecha de nacimiento.";

    return errors;
  };

  const validateTouched = () => {
    const all = validateAll();
    const errs: Record<string, string> = {};
    Object.keys(all).forEach((key) => {
      if (touched[key]) errs[key] = all[key];
    });
    return errs;
  };

  const loadUserProfile = useCallback(async (currentUser: User) => {
    setIsLoading(true);
    try {
      const profile = await getUserProfileFromFirestore(currentUser.uid);
      if (profile) {
        const typedProfileData: UserProfileData = {
          displayName: profile.displayName || "",
          telefono: profile.telefono || "",
          direccion: profile.direccion || "",
          fechaNacimiento: profile.fechaNacimiento || "",
          genero: profile.genero || "",
          photoURL: profile.photoURL,
          email: profile.email,
        };
        setProfileData(typedProfileData);
        setOriginalData(typedProfileData);
        setDisplayName(typedProfileData.displayName);
        setTelefono(typedProfileData.telefono);
        setDireccion(typedProfileData.direccion);
        setFechaNacimiento(typedProfileData.fechaNacimiento);
        setGenero(typedProfileData.genero);
      }
    } catch (error: unknown) {
      let errorMessage = "Error al cargar el perfil desde Firestore:";
      if (error instanceof Error) {
        errorMessage += " " + error.message;
      }
      console.error(errorMessage, error);
      toast.error("Error al cargar la información del perfil.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      if (usr) {
        setUser(usr);
        setPhotoPreview(usr.photoURL || null);
        await loadUserProfile(usr);
      } else {
        setUser(null);
        setProfileData(null);
        setOriginalData(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadUserProfile]);

  useEffect(() => {
    if (user && user.displayName && !displayName) {
      setDisplayName(user.displayName);
    }
    if (profileData && profileData.photoURL && !photoPreview) {
      setPhotoPreview(profileData.photoURL);
    }
  }, [user, profileData, displayName, photoPreview]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateAll();
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Guardando cambios...");
    try {
      await updateUserProfile(
        displayName,
        photoFile,
        { telefono, direccion, fechaNacimiento, genero }
      );

      const updatedData: UserProfileData = {
        displayName,
        telefono,
        direccion,
        fechaNacimiento,
        genero,
      };
      setOriginalData(updatedData);
      setPhotoFile(null);
      toast.success("Perfil actualizado correctamente.", { id: toastId });

      if (user) {
        await loadUserProfile(user);
      }
    } catch (error: unknown) {
      let errorMessage = "Error al actualizar el perfil:";
      if (error instanceof Error) {
        errorMessage += " " + error.message;
      }
      toast.error("Error al actualizar el perfil.", { id: toastId });
      console.error(errorMessage, error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <p className="text-center mt-10">Cargando perfil...</p>;

  const touchedErrors = validateTouched();
  const allErrors = validateAll();
  const canSave = hasChanges() && Object.keys(allErrors).length === 0;

  const loadingSkeleton = (key: string) => (
    <div key={`loading-${key}`} className="flex flex-col gap-1">
      <div className="w-2/3 h-3 bg-gray-300 rounded-md animate-pulse-skeleton" />
      <div className="w-full h-8 bg-gray-200 rounded-md animate-pulse-skeleton" />
    </div>
  );

  const inputField = ({ label, value, onChange, key, type, inputMode }: InputFieldProps) => (
    <div key={key}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(e) => { onChange(e.target.value); setTouched((p) => ({ ...p, [key]: true })); }}
        onBlur={() => setTouched((p) => ({ ...p, [key]: true }))}
        className={`w-full border px-3 py-2 rounded-md text-sm outline-none transition ${
          touchedErrors[key]
            ? "border-red-500 ring-1 ring-red-300"
            : "border-gray-300 focus:ring-2 focus:ring-blue-300"
        }`}
        disabled={isLoading}
      />
      {touchedErrors[key] && (
        <p className="text-red-500 text-xs mt-1">{touchedErrors[key]}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg">
      <Toaster richColors />
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Mi Perfil</h2>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="relative w-28 h-28 mx-auto">
          {isLoading ? (
            <div className="w-full h-full rounded-full bg-gray-200 animate-pulse-skeleton" />
          ) : photoPreview ? (
            <Image
              src={photoPreview}
              alt="Foto de perfil"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200" />
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          >
            <Camera size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setPhotoFile(file);
                setPhotoPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="w-1/2 h-4 bg-gray-300 rounded-md animate-pulse-skeleton mx-auto" />
          </div>
        ) : (
          <p className="text-center mt-2 text-gray-600 text-lg">{user.email}</p>
        )}

        {isLoading ? (
          <>
            {loadingSkeleton("displayName")}
            {loadingSkeleton("telefono")}
            {loadingSkeleton("direccion")}
            {loadingSkeleton("fechaNacimiento")}
            {loadingSkeleton("genero")}
          </>
        ) : (
          <>
            {inputField({ label: "Nombre", value: displayName, onChange: setDisplayName, key: "displayName", type: "text" })}
            {inputField({ label: "Teléfono", value: telefono, onChange: (v: string) => setTelefono(v.replace(/\D/g, "")), key: "telefono", type: "text", inputMode: "numeric" })}
            {inputField({ label: "Dirección", value: direccion, onChange: setDireccion, key: "direccion", type: "text" })}
            {inputField({ label: "Fecha de Nacimiento", value: fechaNacimiento, onChange: setFechaNacimiento, key: "fechaNacimiento", type: "date" })}
            <div>
              <label className="text-sm font-medium text-gray-700">Género</label>
              <select
                value={genero}
                onChange={(e) => { setGenero(e.target.value); setTouched((p) => ({ ...p, genero: true })); }}
                onBlur={() => setTouched((p) => ({ ...p, genero: true }))}
                className={`w-full border px-3 py-2 rounded-md text-sm outline-none transition ${
                  touchedErrors.genero
                    ? "border-red-500 ring-1 ring-red-300"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-300"
                }`}
                disabled={isLoading}
              >
                <option value="">Seleccionar género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              {touchedErrors.genero && (
                <p className="text-red-500 text-xs mt-1">{touchedErrors.genero}</p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-center mt-6">
          <Button
            type="submit"
            disabled={isLoading || isSaving || !canSave}
            className="bg-black text-white px-6 py-2 rounded-md disabled:bg-gray-700"
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}