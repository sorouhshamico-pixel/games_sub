"use client";

import ReactMarkdown from "react-markdown";
import { MotionAccordion, type MotionAccordionItem } from "./motion";

/**
 * Splits the FAQ page's markdown (a flat "## Question\nAnswer" blob — the
 * only structure the CMS's Page model actually stores, see docs) into Q&A
 * pairs for the accordion. Purely a display-time transformation — the
 * content model itself isn't touched, so this works with the exact same
 * markdown the plain-page renderer already uses for every other CMS page.
 */
function parseFaqMarkdown(markdown: string): MotionAccordionItem[] {
  const sections = markdown.split(/\n(?=## )/g).filter((s) => s.trim().startsWith("## "));
  return sections.map((section, index) => {
    const newlineIndex = section.indexOf("\n");
    const question = section.slice(2, newlineIndex === -1 ? undefined : newlineIndex).trim();
    const answer = newlineIndex === -1 ? "" : section.slice(newlineIndex + 1).trim();
    return {
      id: `faq-${index}`,
      trigger: question,
      content: (
        <div className="[&_a]:text-brand-primary [&_a]:underline">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      ),
    };
  });
}

export function FaqAccordion({ markdown }: { markdown: string }) {
  const items = parseFaqMarkdown(markdown);
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
