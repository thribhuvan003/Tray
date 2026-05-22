import React from "react";

interface FSSAIBadgeProps {
  type: "veg" | "non-veg";
  licenseNumber?: string;
}

export function FSSAIBadge({ type, licenseNumber = "1002409900018" }: FSSAIBadgeProps) {
  const isVeg = type === "veg";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .fssai-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--tray-border);
          border-radius: 12px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s;
          cursor: default;
        }
        .fssai-card:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .fssai-badge-container {
          position: relative;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fssai-badge-veg, .fssai-badge-nonveg {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .fssai-outer-square {
          width: 18px;
          height: 18px;
          border: 2px solid var(--fssai-color);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
          background: #fff;
          z-index: 2;
          transition: transform 0.4s var(--ease-snappy);
        }
        .fssai-badge-veg { --fssai-color: #0c8a43; }
        .fssai-badge-nonveg { --fssai-color: #b32b2b; }
        
        .fssai-inner-circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--fssai-color);
          transition: transform 0.4s var(--ease-snappy);
        }
        .fssai-inner-triangle {
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 9px solid var(--fssai-color);
          transition: transform 0.4s var(--ease-snappy);
        }
        
        .fssai-card:hover .fssai-outer-square { transform: rotate(180deg); }
        .fssai-card:hover .fssai-inner-circle, 
        .fssai-card:hover .fssai-inner-triangle { transform: scale(1.3); }

        .fssai-pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 4px;
          border: 1.5px solid var(--fssai-color);
          opacity: 0;
          z-index: 1;
        }

        .fssai-badge-veg .ring-1 { animation: fssaiPulse 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }
        .fssai-badge-veg .ring-2 { animation: fssaiPulse 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite 0.7s; }
        .fssai-badge-nonveg .ring-1 { animation: fssaiPulse 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite 0.35s; }
        .fssai-badge-nonveg .ring-2 { animation: fssaiPulse 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite 1.05s; }

        @keyframes fssaiPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .fssai-info {
          display: flex;
          flex-direction: column;
        }
        .fssai-tag {
          font-family: var(--font-dm-mono);
          font-size: 0.55rem;
          font-weight: 700;
          color: #0c8a43;
          letter-spacing: 0.05em;
        }
        .fssai-tag.nonveg { color: #b32b2b; }
        .fssai-lic {
          font-family: var(--font-geist);
          font-size: 0.6rem;
          color: var(--tray-muted);
          opacity: 0.7;
        }
      `}} />

      <div className="fssai-card">
        <div className="fssai-badge-container">
          <div className={isVeg ? "fssai-badge-veg" : "fssai-badge-nonveg"}>
            <div className="fssai-outer-square">
              {isVeg ? <div className="fssai-inner-circle"></div> : <div className="fssai-inner-triangle"></div>}
            </div>
            <div className="fssai-pulse-ring ring-1"></div>
            <div className="fssai-pulse-ring ring-2"></div>
          </div>
        </div>
        <div className="fssai-info">
          <span className={`fssai-tag ${!isVeg ? "nonveg" : ""}`}>{isVeg ? "VEG" : "NON-VEG"}</span>
          <span className="fssai-lic">Lic. {licenseNumber}</span>
        </div>
      </div>
    </>
  );
}
