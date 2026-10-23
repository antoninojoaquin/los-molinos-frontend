import { useEffect } from "react";

const SITE_NAME = "Los Molinos Regionales";

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
