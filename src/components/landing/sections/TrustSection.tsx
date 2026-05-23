"use client";

import { SectionReveal, RevealItem, HoverCard, tm } from "@/lib/motion/tray-framer";
import { ShieldCheck, Landmark, Percent } from "lucide-react";
import { motion } from "framer-motion";

export function TrustSection() {
  const trustItems = [
    {
      icon: <Landmark className="h-6 w-6 text-[var(--tray-clay)]" />,
      title: "Direct UPI Settlements",
      tag: "Direct to Bank",
      desc: "Payments are routed directly from student UPI to your canteen's merchant account via Razorpay. Zero holding periods, zero escrow delays, and zero middleman risk.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
      title: "Bank-Grade Postgres RLS",
      tag: "Secure Tenant Isolation",
      desc: "Menu data, transaction records, and student profiles are strictly partitioned. Postgres Row Level Security (RLS) ensures total tenant isolation and absolute privacy.",
    },
    {
      icon: <Percent className="h-6 w-6 text-amber-600" />,
      title: "0% Order Commissions",
      tag: "100% Canteen Revenue",
      desc: "Unlike commercial delivery aggregators, Tray charges zero commission on orders. Keep every rupee of your revenue and run your business on your own terms.",
    },
  ] as const;

  return (
    <section id="trust" className="px-5 py-20 sm:px-8 lg:px-10 border-b border-[var(--tray-border)] lg:min-h-screen lg:flex lg:flex-col lg:justify-center lg:py-24">
      <div className="mx-auto max-w-7xl">
        <RevealItem initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="font-code text-xs uppercase tracking-[0.3em] text-[var(--tray-muted)]">
              Trust & Security
            </p>
          </div>
        </RevealItem>

        <RevealItem initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <h2
            className="max-w-3xl leading-[0.9] tracking-[-0.04em]"
            style={{
              fontFamily: "var(--font-barlow)",
              fontWeight: 900,
              fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
              textTransform: "uppercase",
            }}
          >
            Built for trust,{" "}
            <em className="not-italic" style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", textTransform: "none", color: "var(--tray-clay)" }}>
              backed by code.
            </em>
          </h2>
        </RevealItem>

        <RevealItem initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-8 opacity-70"
            style={{ fontFamily: "var(--font-geist)" }}>
            Tray is designed as a secure, decentralized campus platform. You own your data, control your revenue flow, and run your operations with confidence.
          </p>
        </RevealItem>

        {/* Staggered card reveals */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.5
              }
            }
          }}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 35, scale: 0.96 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: tm.ease } }
              }}
            >
              <HoverCard
                className="flex h-full flex-col justify-between rounded-[2.25rem] border p-8 sm:p-9 transition-all"
                style={{
                  border: "1px solid var(--tray-border)",
                  background: "rgba(255,255,255,0.48)",
                }}
              >
                <div className="flex flex-col h-full">
                  {/* Top: Icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tray-surface)] border border-[var(--tray-border)] mb-6">
                    {item.icon}
                  </div>

                  {/* Eyebrow / Tag */}
                  <span
                    className="text-[0.72rem] font-semibold uppercase tracking-[0.15em] block mb-2"
                    style={{ fontFamily: "var(--font-geist)", color: "var(--tray-clay)" }}
                  >
                    {item.tag}
                  </span>

                  {/* Title */}
                  <h3
                    className="mb-4 text-[1.75rem] font-medium tracking-tight text-neutral-900 leading-[1.2]"
                    style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic" }}
                  >
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-[0.88rem] leading-[1.65] text-neutral-600 opacity-80"
                    style={{ fontFamily: "var(--font-geist)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </HoverCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
