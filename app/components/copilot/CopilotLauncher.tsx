"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Copilot = dynamic(() => import("./Copilot"), { ssr: false });

export default function CopilotLauncher() {
  const [loaded, setLoaded] = useState(false);
  const [openOnLoad, setOpenOnLoad] = useState(false);

  return (
    <>
      {!loaded ? (
        <button
          className="mn-copilot-fab"
          onClick={() => {
            setLoaded(true);
            setOpenOnLoad(true);
          }}
          title="AI Copilot (⌘/Ctrl + K)"
        >
          ✨ Copilot
        </button>
      ) : null}

      {loaded ? <Copilot defaultOpen={openOnLoad} /> : null}
    </>
  );
}
