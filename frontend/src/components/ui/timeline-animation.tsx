"use client";
import { motion, Variants } from "framer-motion";
import { ElementType, ReactNode, RefObject } from "react";

interface TimelineContentProps {
  children: ReactNode;
  as?: ElementType;
  animationNum?: number;
  timelineRef?: RefObject<HTMLElement>;
  customVariants?: Record<string, unknown>;
  className?: string;
  key?: any;
}

export function TimelineContent({
  children,
  as: Tag = "div",
  className,
  customVariants,
  animationNum = 0,
}: TimelineContentProps) {
  const variants: Variants = (customVariants as Variants) ?? {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.15, duration: 0.5 },
    }),
  };
  return (
    <motion.div
      className={className}
      custom={animationNum}
      initial="hidden"
      animate="visible"
      variants={variants}
    >
      {/* @ts-ignore */}
      <Tag>{children}</Tag>
    </motion.div>
  );
}
