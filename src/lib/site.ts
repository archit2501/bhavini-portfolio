export const site = {
  name: 'Bhavini Malhotra',
  role: 'Sales & Operations',
} as const;

/** Page titles never mention Instagram: "Bhavini Malhotra · Sales & Operations", or "<page> · Bhavini Malhotra". */
export function pageTitle(page?: string): string {
  const trimmed = page?.trim();
  return trimmed ? `${trimmed} · ${site.name}` : `${site.name} · ${site.role}`;
}

/**
 * Colour field for a text post, from its 1-based grid order. Shifting by one each row of three
 * gives a diagonal pattern instead of single-colour columns.
 */
export function tileTone(order: number): 1 | 2 | 3 {
  const i = order - 1;
  return (((i + Math.floor(i / 3)) % 3) + 1) as 1 | 2 | 3;
}
