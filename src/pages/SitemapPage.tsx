import React from 'react';
import { DynamicSitemapGenerator } from '../components/DynamicSitemapGenerator';
import { SEOHead } from '../components/SEOHead';
import { useRouter } from '../router/RouterContext';

export const SitemapPage: React.FC = () => {
  const { currentPath } = useRouter();
  const isXmlRoute = currentPath === '/sitemap.xml';

  return (
    <div className="w-full max-w-[96rem] mx-auto px-3 sm:px-6 lg:px-8 py-8">
      <SEOHead
        pagePath="/sitemap.xml"
        title="Dynamic XML Sitemap & Index | Tutorials and Code"
        description="Search engine and crawler XML index of all published articles, category tracks, and author profiles crawled dynamically from Firestore."
        canonicalUrl="https://www.tutorialsandcode.in/sitemap.xml"
      />

      <DynamicSitemapGenerator initialFormat={isXmlRoute ? 'xml' : 'visual'} />
    </div>
  );
};
