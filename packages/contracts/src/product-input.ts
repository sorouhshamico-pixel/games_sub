import { z } from "zod";

// Defines a single field a customer must fill in to fulfill a product
// (Player ID, Server ID, Region, Email, ...). Rendered dynamically on the
// product page and re-validated server-side before checkout.
export const productInputFieldSchema = z.object({
  key: z.string().min(1),
  labelAr: z.string().min(1),
  labelEn: z.string().min(1),
  helpTextAr: z.string().optional(),
  helpTextEn: z.string().optional(),
  type: z.enum(["text", "number", "select", "email"]),
  required: z.boolean().default(true),
  regex: z.string().optional(),
  minLength: z.number().int().positive().optional(),
  maxLength: z.number().int().positive().optional(),
  options: z.array(z.object({ value: z.string(), labelAr: z.string(), labelEn: z.string() })).optional(),
  normalize: z.enum(["trim", "trimAndUppercase", "digitsOnly"]).default("trim"),
});
export type ProductInputField = z.infer<typeof productInputFieldSchema>;

export const productInputSchemaSchema = z.array(productInputFieldSchema);
export type ProductInputSchema = z.infer<typeof productInputSchemaSchema>;

export function validateProductInputValues(
  schema: ProductInputSchema,
  values: Record<string, string>,
): { valid: true } | { valid: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of schema) {
    const raw = values[field.key];
    if (field.required && (!raw || raw.trim().length === 0)) {
      errors[field.key] = "required";
      continue;
    }
    if (!raw) continue;

    const normalized =
      field.normalize === "trimAndUppercase"
        ? raw.trim().toUpperCase()
        : field.normalize === "digitsOnly"
          ? raw.replace(/\D/g, "")
          : raw.trim();

    if (field.minLength && normalized.length < field.minLength) {
      errors[field.key] = "too_short";
      continue;
    }
    if (field.maxLength && normalized.length > field.maxLength) {
      errors[field.key] = "too_long";
      continue;
    }
    if (field.regex && !new RegExp(field.regex).test(normalized)) {
      errors[field.key] = "invalid_format";
    }
  }

  return Object.keys(errors).length > 0 ? { valid: false, errors } : { valid: true };
}
