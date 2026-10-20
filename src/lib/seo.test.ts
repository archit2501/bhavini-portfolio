import { describe, expect, it } from 'vitest';
import { profileSchema } from './content-schema';
import { jsonLdScript, personJsonLd, robotsTxt, sitemapXml } from './seo';

const base = {
  username: 'bhavini.malhotra',
  displayName: 'Bhavini Malhotra',
  category: 'Sales & Operations',
  bio: 'Bio',
  location: 'Bengaluru',
  avatar: { alt: 'Bhavini Malhotra' },
  stats: ['a', 'b', 'c'],
  links: { linkedin: 'https://www.linkedin.com/in/example' },
};

describe('personJsonLd', () => {
  it('describes her with resume facts only', () => {
    const profile = profileSchema.parse({
      ...base,
      jobTitle: 'Sales & Operations Executive',
      organization: { name: 'F1Jobs.io', url: 'https://f1jobs.io' },
      education: 'Christ University',
    });
    expect(personJsonLd(profile, 'https://example.com/')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Bhavini Malhotra',
      url: 'https://example.com/',
      jobTitle: 'Sales & Operations Executive',
      worksFor: { '@type': 'Organization', name: 'F1Jobs.io', url: 'https://f1jobs.io' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'Christ University' },
      address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru' },
      sameAs: ['https://www.linkedin.com/in/example'],
    });
  });

  it('leaves out fields the profile does not have', () => {
    const data = personJsonLd(profileSchema.parse(base), 'https://example.com/');
    expect(data).not.toHaveProperty('jobTitle');
    expect(data).not.toHaveProperty('worksFor');
    expect(data).not.toHaveProperty('alumniOf');
  });
});

describe('jsonLdScript', () => {
  it('cannot close its own script tag', () => {
    expect(jsonLdScript({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});

describe('sitemapXml and robotsTxt', () => {
  it('lists every URL, escaped', () => {
    const xml = sitemapXml(['https://example.com/', 'https://example.com/p/a&b/']);
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/p/a&amp;b/</loc>');
    expect(xml.match(/<url>/g)).toHaveLength(2);
  });

  it('points crawlers at the sitemap', () => {
    expect(robotsTxt('https://example.com/sitemap.xml')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml\n',
    );
  });
});
