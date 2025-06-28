
import { Suspense } from "react";
import ResetPassword from "@/components/ResetPassword";
export default function Page() {
  return (
    <Suspense fallback={<p>Lade Formular...</p>}>
      <ResetPassword />
    </Suspense>
  );
}
