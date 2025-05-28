"use client";

import { useSearchParams } from "next/navigation";

export default function CustomNotFoundContent() {
  const searchParams = useSearchParams();
  // puedes usar searchParams aquí

  return <div>Página no encontrada</div>;
}
