import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, isAdmin } from "./api";

// status: loading | signedOut | forbidden (logueado pero sin admins/{uid}) | admin
export default function useAdmin() {
  const [state, setState] = useState({ status: "loading", user: null });

  useEffect(
    () =>
      onAuthStateChanged(auth, async (user) => {
        if (!user) return setState({ status: "signedOut", user: null });
        setState({ status: "loading", user });
        const ok = await isAdmin(user.uid).catch(() => false);
        setState({ status: ok ? "admin" : "forbidden", user });
      }),
    []
  );

  return state;
}
