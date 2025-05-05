"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, loginWithGoogle } from "@/lib/authService";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { AuthError } from "firebase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [genero, setGenero] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await registerUser({
        displayName,
        email,
        password,
        telefono,
        direccion,
        fechaNacimiento,
        genero,
      });
      toast.success("Registro exitoso. Redirigiendo al perfil...");
      router.push("/perfil");
    } catch (error: unknown) {
      let message = "Error al registrar usuario. Verifica tus datos.";
      if (error instanceof Error) {
        console.error("Error al registrar:", error.message);
        message = `Error al registrar usuario: ${error.message}`;
      } else {
        console.error("Error desconocido al registrar:", error);
      }
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await loginWithGoogle();
      toast.success("Registro con Google exitoso. Redirigiendo al perfil...");
      router.push("/perfil");
    } catch (error: unknown) {
      let message = "Error al registrar con Google.";
      if (error instanceof Error) {
        console.error("Error al registrar con Google:", error.message);
        message = `Error al registrar con Google: ${error.message}`;
      } else {
        console.error("Error desconocido al registrar con Google:", error);
      }
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <Toaster richColors />
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Crear cuenta</h2>
        <div className="mt-6">
          <Button
            type="button"
            className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <FcGoogle className="text-2xl" />
            Continuar con Google
          </Button>
          <br />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm leading-5">
              <span className="bg-white px-2 text-gray-500">O registra tus datos</span>
            </div>
          </div>
          <br />
        </div>
        {errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
            required
          />
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
            required
          />
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-300 outline-none"
            required
          >
            <option value="">Selecciona tu género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
      </div>
    </div>
  );
}