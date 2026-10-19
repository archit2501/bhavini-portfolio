export const site = {
  name: 'Bhavini Malhotra',
  role: 'Sales & Operations',
} as const;

/** Page titles never mention Instagram: "Bhavini Malhotra · Sales & Operations", or "<page> · Bhavini Malhotra". */
export function pageTitle(page?: string): string {
  const trimmed = page?.trim();
  return trimmed ? `${trimmed} · ${site.name}` : `${site.name} · ${site.role}`;
}
