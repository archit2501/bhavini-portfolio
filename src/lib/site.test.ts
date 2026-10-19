import { describe, expect, it } from 'vitest';
import { pageTitle } from './site';

describe('pageTitle', () => {
  it('uses her name and role on the home page', () => {
    expect(pageTitle()).toBe('Bhavini Malhotra · Sales & Operations');
  });

  it('puts the page name first on inner pages', () => {
    expect(pageTitle('$100K+ revenue')).toBe('$100K+ revenue · Bhavini Malhotra');
  });

  it('falls back to the home title for a blank page name', () => {
    expect(pageTitle('   ')).toBe('Bhavini Malhotra · Sales & Operations');
  });

  it('never mentions Instagram', () => {
    expect(pageTitle().toLowerCase()).not.toContain('instagram');
    expect(pageTitle('Highlights').toLowerCase()).not.toContain('instagram');
  });
});
