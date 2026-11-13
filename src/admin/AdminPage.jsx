import { useEffect, useState } from "react";
import { FaGoogle, FaSignOutAlt, FaExternalLinkAlt } from "react-icons/fa";
import Logo from "../assets/logo.png";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { logOut, signIn } from "./api";
import ProductManager from "./ProductManager";
import useAdmin from "./useAdmin";

// El panel no tiene que aparecer en Google
function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setBusy(true);
    setError("");
    try {
      await signIn();
    } catch (err) {
      // Cerrar la ventana de Google no es un error
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        setError("No se pudo iniciar sesión. Probá de nuevo.");
      }
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 px-4">
      <img src={Logo} alt="Los Molinos Regionales" className="h-32 w-auto" />
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 flex flex-col gap-4 text-center">
        <h1 className="text-white text-2xl">Panel de administración</h1>
        <p className="text-gray-400">Ingresá para gestionar el catálogo.</p>
        <button
          onClick={handleSignIn}
          disabled={busy}
          className="flex items-center justify-center gap-3 py-3 rounded-full bg-orange-500 hover:bg-orange-400 disabled:bg-gray-600 text-white font-semibold cursor-pointer disabled:cursor-wait"
        >
          <FaGoogle />
          {busy ? "Ingresando…" : "Ingresar con Google"}
        </button>
        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}
      </div>
      <a href="/" className="text-gray-400 hover:text-orange-400">← Volver a la tienda</a>
    </div>
  );
}

export default function AdminPage() {
  const { status, user } = useAdmin();
  useDocumentTitle("Panel");
  useNoIndex();

  if (status === "signedOut") return <Login />;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <header className="bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center gap-4">
          <a href="/" className="shrink-0">
            <img src={Logo} alt="Los Molinos Regionales" className="h-20 w-auto" />
          </a>
          <span className="text-xs font-semibold uppercase tracking-wide bg-orange-500 text-white px-2 py-1 rounded-full">
            Panel
          </span>
          <div className="ml-auto flex items-center gap-4">
            {user && <span className="hidden sm:block text-sm text-gray-400 truncate">{user.email}</span>}
            <a
              href="/productos"
              target="_blank"
              rel="noopener"
              aria-label="Ver la tienda"
              title="Ver la tienda"
              className="text-gray-300 hover:text-orange-400"
            >
              <FaExternalLinkAlt />
            </a>
            {user && (
              <button
                onClick={logOut}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-orange-400 cursor-pointer"
              >
                <FaSignOutAlt />
                Salir
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {status === "loading" && <p className="text-gray-400">Cargando…</p>}
        {status === "forbidden" && (
          <div className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-3">
            <p>La cuenta {user.email} no tiene permisos de administrador.</p>
            <p className="text-gray-400 text-sm">
              Para darle permisos, creá en Firestore el documento <code>admins/{user.uid}</code>{" "}
              (puede estar vacío) y recargá la página.
            </p>
            <code className="self-start bg-gray-950 px-3 py-2 rounded text-orange-300 select-all break-all">
              {user.uid}
            </code>
          </div>
        )}
        {status === "admin" && <ProductManager />}
      </main>
    </div>
  );
}
