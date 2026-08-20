import React from 'react';
import { DynamicSitemapGenerator } from '../components/DynamicSitemapGenerator';
import { SEOHead } from '../components/SEOHead';
import { useRouter } from '../router/RouterContext';

export const SitemapPage: React.FC = () => {
  const { currentPath } = useRouter();
  const isXmlRoute = currentPath === '/sitemap.xml';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEOHead
        title="Dynamic XML Sitemap & Index | Tutorials and Code"
        description="Search engine and crawler XML index of all published articles, category tracks, and author profiles crawled dynamically from Firestore."
        canonicalUrl="https://tutorialsandcode.dev/sitemap.xml"
      />

      <DynamicSitemapGenerator initialFormat={isXmlRoute ? 'xml' : 'visual'} />
    </div>
  );
};
