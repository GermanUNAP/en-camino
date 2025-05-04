"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithGoogle } from "@/lib/authService";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      router.push("/"); 
    } catch (error: any) {
      setErrorMsg("Correo o contraseña incorrectos");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (error: any) {
      setErrorMsg("Error al iniciar sesión con Google");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>

        {errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-2 rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded-md"
            required
          />
          <Button type="submit" className="w-full">
            Iniciar sesión
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="mb-2">O inicia sesión con:</p>
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
            Google
          </Button>
        </div>
      </div>
    </div>
  );
}
