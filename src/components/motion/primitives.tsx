"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* ─── Scroll-reveal ──────────────────────────────────────────── */
const hidden  = { opacity: 0, y: 22 };
const visible = { opacity: 1, y: 0 };

export function Reveal({
  children, delay = 0, className,
}: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export function RevealStack({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden, visible }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Tear reveal ────────────────────────────────────────────── */
/**
 * Word-by-word "tear" entrance. Each word slides up from hidden like paper
 * being torn upward, with a stagger between words.
 *
 * Usage: <TearReveal text="বিশ্বমানের ভোটিং" className="text-2xl font-bold" />
 */
export function TearReveal({
  text,
  className,
  delay = 0,
  staggerDelay = 0.07,
}: {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const words  = text.split(" ");

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em]">
          <motion.span
            className="inline-block"
            initial={{ y: "105%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{
              delay: delay + i * staggerDelay,
              duration: 0.52,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-hidden
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * Line-by-line tear reveal — wrap each child in a clip so it tears upward.
 * Pass children as an array of lines.
 */
export function TearLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden pb-[0.05em]">
          <motion.div
            className={lineClassName}
            initial={{ y: "105%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{
              delay: delay + i * 0.14,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* ─── Tactile press ──────────────────────────────────────────── */
export function Tactile({
  children, className, onClick,
}: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={className}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.button>
  );
}
