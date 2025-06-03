"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
import { updateUserProfile, getUserProfileFromFirestore } from "@/lib/authService";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { Camera, LogOut } from "lucide-react";

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
  fieldKey: string;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: "email" | "search" | "tel" | "text" | "url" | "numeric" | "none" | "decimal" | undefined;
  placeholder?: string;
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasChanges = useCallback(() => {
    if (!originalData) return false;
    return (
      displayName !== originalData.displayName ||
      telefono !== originalData.telefono ||
      direccion !== originalData.direccion ||
      fechaNacimiento !== originalData.fechaNacimiento ||
      genero !== originalData.genero ||
      photoFile !== null
    );
  }, [displayName, telefono, direccion, fechaNacimiento, genero, photoFile, originalData]);

  const validateAll = () => {
    const errors: Record<string, string> = {};
    const phoneRegex = /^9[0-9]{8}$/;
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;

    if (!nameRegex.test(displayName)) errors.displayName = "Nombre inválido. Debe contener al menos 3 letras y solo caracteres alfabéticos.";
    if (!phoneRegex.test(telefono)) errors.telefono = "Teléfono inválido. Debe comenzar con 9 y tener 9 dígitos.";
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
      console.error("Error al cargar el perfil:", error);
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
      Object.values(errors).forEach(errorMsg => toast.error(errorMsg));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Guardando cambios...");
    try {
      await updateUserProfile(displayName, photoFile, { telefono, direccion, fechaNacimiento, genero });
      setOriginalData({ displayName, telefono, direccion, fechaNacimiento, genero });
      setPhotoFile(null);
      toast.success("Perfil actualizado correctamente.", { id: toastId });
      if (user) await loadUserProfile(user);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast.error("Error al actualizar el perfil.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    const auth = getAuth();
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente.");
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión.");
    }
  };

  const touchedErrors = validateTouched();
  const allErrors = validateAll();
  const canSave = hasChanges() && Object.keys(allErrors).length === 0;

  const inputField = ({ label, value, onChange, fieldKey, type, inputMode, placeholder }: InputFieldProps) => (
    <div key={fieldKey}>
      <label className="text-sm font-semibold text-gray-800">{label}</label>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(e) => {
          onChange(e.target.value);
          setTouched((prev) => ({ ...prev, [fieldKey]: true }));
        }}
        onBlur={() => setTouched((prev) => ({ ...prev, [fieldKey]: true }))}
        className={`w-full mt-1 border px-3 py-2 rounded-lg text-sm outline-none transition ${
          touchedErrors[fieldKey]
            ? "border-red-500 ring-1 ring-red-300"
            : "border-gray-300 focus:ring-2 focus:ring-blue-300"
        } focus:border-transparent`}
        disabled={isLoading}
        placeholder={placeholder}
      />
      {touchedErrors[fieldKey] && <p className="text-red-500 text-xs mt-1">{touchedErrors[fieldKey]}</p>}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl space-y-6">
      <Toaster richColors />
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mi Perfil</h2>
          <p className="text-gray-500">{user?.email}</p>
        </div>
        <Button variant="ghost" className="text-red-500 flex items-center gap-2 hover:bg-red-50" onClick={() => setShowLogoutModal(true)}>
          <LogOut size={18} />
          Cerrar sesión
        </Button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            {isLoading ? (
              <div className="w-full h-full rounded-full bg-gray-200 animate-pulse-skeleton" />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {photoPreview ? (
                  <Image src={photoPreview} alt="Foto de perfil" fill className="rounded-full object-cover" />
                ) : (
                  <span className="text-5xl text-gray-500 font-semibold">{displayName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition transform hover:scale-105 flex items-center justify-center"
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
                  setTouched((prev) => ({ ...prev, photo: true }));
                }
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inputField({ label: "Nombre Completo", value: displayName, onChange: setDisplayName, fieldKey: "displayName", type: "text", placeholder: "Tu nombre completo" })}
          {inputField({ label: "Teléfono", value: telefono, onChange: (v: string) => setTelefono(v.replace(/\D/g, "")), fieldKey: "telefono", type: "tel", inputMode: "numeric", placeholder: "Ej. 912345678" })}
          {inputField({ label: "Dirección", value: direccion, onChange: setDireccion, fieldKey: "direccion", type: "text", placeholder: "Tu dirección de residencia" })}
          {inputField({ label: "Fecha de Nacimiento", value: fechaNacimiento, onChange: setFechaNacimiento, fieldKey: "fechaNacimiento", type: "date" })}
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-800">Género</label>
          <select
            value={genero}
            onChange={(e) => {
              setGenero(e.target.value);
              setTouched((prev) => ({ ...prev, genero: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, genero: true }))}
            className="w-full mt-1 border px-3 py-2 rounded-lg text-sm outline-none transition border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">Seleccione</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <Button type="submit" disabled={!canSave || isSaving} className="w-full mt-4 py-2 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition transform hover:scale-105">
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-2xl max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Confirmar cierre de sesión</h3>
            <p className="text-gray-700">¿Estás seguro de que quieres cerrar tu sesión?</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowLogoutModal(false)} className="text-gray-600 hover:bg-gray-100">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmLogout} className="bg-red-500 hover:bg-red-600 text-white">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}