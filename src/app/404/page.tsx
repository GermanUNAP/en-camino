// app/404.tsx

"use client";

import { Suspense } from "react";
import CustomNotFoundContent from "../../../components/customNotFoundContent";
export default function NotFound() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CustomNotFoundContent />
    </Suspense>
  );
}
