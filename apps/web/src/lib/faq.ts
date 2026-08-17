export interface FaqSection {
  id: string;
  question: string;
  answer: string;
}

/**
 * Splits the FAQ page's markdown (a flat "## Question\nAnswer" blob — the
 * only structure the CMS's Page model actually stores) into Q&A pairs.
 * Purely a display-time transformation shared by the full FAQ accordion and
 * the homepage preview — the content model itself is never touched.
 */
export function parseFaqMarkdown(markdown: string): FaqSection[] {
  const sections = markdown.split(/\n(?=## )/g).filter((s) => s.trim().startsWith("## "));
  return sections.map((section, index) => {
    const newlineIndex = section.indexOf("\n");
    const question = section.slice(2, newlineIndex === -1 ? undefined : newlineIndex).trim();
    const answer = newlineIndex === -1 ? "" : section.slice(newlineIndex + 1).trim();
    return { id: `faq-${index}`, question, answer };
  });
}
