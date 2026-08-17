"use client";

import ReactMarkdown from "react-markdown";
import { parseFaqMarkdown } from "@/lib/faq";
import { MotionAccordion, type MotionAccordionItem } from "./motion";

export function FaqAccordion({ markdown }: { markdown: string }) {
  const items: MotionAccordionItem[] = parseFaqMarkdown(markdown).map((section) => ({
    id: section.id,
    trigger: section.question,
    content: (
      <div className="[&_a]:text-brand-primary [&_a]:underline">
        <ReactMarkdown>{section.answer}</ReactMarkdown>
      </div>
    ),
  }));
  // Fall back to flat markdown if the content isn't actually "## "
  // structured (defensive — shouldn't happen for the seeded FAQ page, but
  // an admin-edited FAQ page might not follow the convention).
  if (items.length === 0) {
    return (
      <div className="[&_a]:text-brand-primary [&_a]:underline">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    );
  }
  return <MotionAccordion items={items} />;
}
