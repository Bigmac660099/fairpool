"use client";

import { motion } from "framer-motion";
import { bn } from "@/i18n/bn";

/** SVG checkmark draw-on animation shown after a successful vote. */
export function VoteSuccessPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <motion.svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        initial="hidden"
        animate="visible"
      >
        <motion.circle
          cx="48"
          cy="48"
          r="44"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d="M30 50 L43 63 L67 35"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
      </motion.svg>
      <motion.p
        className="text-lg font-semibold text-primary"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        {bn.vote.success}
      </motion.p>
    </div>
  );
}
