"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

interface ProductRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  eager?: boolean
}

export function ProductReveal({
  children,
  className,
  delay = 0,
  eager = false,
}: ProductRevealProps) {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const visible = { opacity: 1, y: 0 }

  return (
    <motion.div
      className={cn("product-reveal", className)}
      initial={{ opacity: 0, y: 28 }}
      animate={eager ? visible : undefined}
      whileInView={eager ? undefined : visible}
      viewport={{ once: true, amount: 0.18 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  )
}
