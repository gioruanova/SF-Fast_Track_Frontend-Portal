"use client";

import { useEffect, useState } from "react";
import InstallIcon from "./InstallIcon";
import { InstallInstructionsModal } from "./InstallInstructionsModal";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Navigator {
    standalone?: boolean; // solo ios
  }
}

export const InstallButton = () => {

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [isIOS, setIsIOS] = useState(false);
  const [isMacSafari, setIsMacSafari] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    const macSafari = /macintosh/.test(ua) && /safari/.test(ua) && !/chrome|chromium|edg/.test(ua);

    setIsIOS(ios);
    setIsMacSafari(macSafari);

    const isIOSStandalone = () => navigator.standalone === true;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || isIOSStandalone();

    if (isStandalone) return; // si ya esta instalada, no mostrar nada

    // android / windows / chrome
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);

    // ios / macos safari: mostrar boton siempre
    if (ios || macSafari) {
      setShowButton(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);


  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setShowButton(false);
      setDeferredPrompt(null);
    } else if (isIOS || isMacSafari) {
      setShowModal(true);
    }
  };

  if (!showButton && !showModal) return null;

  return (
    <>
      {showButton && <InstallIcon onClick={handleInstallClick} />}
      {showModal && <InstallInstructionsModal onClose={() => setShowModal(false)} />}
    </>
  );
};
