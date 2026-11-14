import { useState } from "react";

// Dispara un estallido de components/Burst.jsx: const [burst, fire] = useBurst(); fire() al agregar
export default function useBurst() {
  const [burstKey, setBurstKey] = useState(0);
  return [burstKey, () => setBurstKey((key) => key + 1)];
}
