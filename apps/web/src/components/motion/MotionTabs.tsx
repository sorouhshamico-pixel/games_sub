"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@gcc-store/ui";
import { spring } from "@/lib/motion/tokens";

export interface MotionTab {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export function MotionTabs({ tabs, defaultTabId }: { tabs: MotionTab[]; defaultTabId?: string }) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id);
  // Unique per instance so multiple <MotionTabs> on one page don't share a
  // layoutId and animate each other's indicators.
  const layoutId = useId();
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium transition-colors",
                isActive ? "text-brand-primary" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {tab.label}
              {isActive ? (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-primary"
                  transition={{ type: "spring", ...spring }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="pt-4">
        {active?.content}
      </div>
    </div>
  );
}
