import React from "react";
import Link from "next/link";

interface LiquidButtonProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  style?: React.CSSProperties;
}

export function LiquidButton({ href, children, icon, className, style }: LiquidButtonProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .liquid-btn {
          position: relative;
          background: var(--tray-ink);
          border: 1.5px solid var(--tray-ink);
          border-radius: 30px;
          padding: 14px 32px;
          font-family: var(--font-geist);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--tray-cream);
          cursor: pointer;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease-out;
          z-index: 1;
        }
        .liquid-btn-text, .liquid-btn-icon {
          position: relative;
          z-index: 3;
          transition: color 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease-out;
        }
        .liquid-btn-wave {
          position: absolute;
          bottom: -100%;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
          transition: bottom 0.65s cubic-bezier(0.76, 0, 0.24, 1);
          display: flex;
          flex-direction: column;
          filter: url('#goo');
        }
        .liquid-wave-svg {
          width: 100%;
          height: 16px;
          fill: var(--tray-clay);
          position: absolute;
        }
        .liquid-wave-1 {
          margin-top: -15px;
          animation: waveFlow1 2.2s infinite linear;
          opacity: 0.85;
        }
        .liquid-wave-2 {
          margin-top: -12px;
          animation: waveFlow2 1.6s infinite linear;
        }
        .liquid-wave-fill {
          flex: 1;
          width: 100%;
          margin-top: 1px;
        }
        .liquid-btn:hover {
          border-color: var(--tray-clay);
          transform: scale(1.03);
        }
        .liquid-btn:hover .liquid-btn-text {
          color: #fff;
        }
        .liquid-btn:hover .liquid-btn-icon {
          transform: scale(1.2) rotate(15deg);
        }
        .liquid-btn:hover .liquid-btn-wave {
          bottom: 0%;
        }
        @keyframes waveFlow1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-24px); }
        }
        @keyframes waveFlow2 {
          0% { transform: translateX(0); }
          100% { transform: translateX(24px); }
        }
      `}} />
      <Link href={href} className={`liquid-btn ${className || ""}`} style={style}>
        <span className="liquid-btn-text">{children}</span>
        <div className="liquid-btn-wave">
          <svg viewBox="0 0 120 28" className="liquid-wave-svg liquid-wave-1" preserveAspectRatio="none">
            <path d="M0,28 C30,28 30,14 60,14 C90,14 90,28 120,28 L120,28 L0,28 Z" />
          </svg>
          <svg viewBox="0 0 120 28" className="liquid-wave-svg liquid-wave-2" preserveAspectRatio="none">
            <path d="M0,28 C30,28 30,18 60,18 C90,18 90,28 120,28 L120,28 L0,28 Z" />
          </svg>
          <div className="liquid-wave-fill" style={{ background: "var(--tray-clay)" }}></div>
        </div>
        {icon && <span className="liquid-btn-icon">{icon}</span>}
      </Link>
    </>
  );
}
