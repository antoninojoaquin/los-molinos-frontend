import { useEffect, useRef } from "react";

// <dialog> nativo: foco atrapado, Escape y fondo bloqueado sin librerías
export default function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel, danger = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      // Click en el fondo (fuera de la tarjeta) cierra
      onClick={(event) => event.target === event.currentTarget && onCancel()}
      className="m-auto rounded-2xl bg-transparent p-0 backdrop:bg-black/70"
    >
      <div className="w-[min(92vw,26rem)] bg-gray-800 text-gray-200 rounded-2xl p-6 flex flex-col gap-4">
        <h2 id="confirm-title" className="text-white text-xl">
          {title}
        </h2>
        <p className="text-gray-300">{children}</p>
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onCancel}
            autoFocus
            className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-full text-white font-semibold cursor-pointer ${
              danger ? "bg-red-600 hover:bg-red-500" : "bg-orange-500 hover:bg-orange-400"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
