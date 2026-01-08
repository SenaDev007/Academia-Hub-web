/**
 * Template de Page avec SEO Automatique
 * 
 * Utilisez ce template pour créer de nouvelles pages publiques
 * Les métadonnées SEO sont automatiquement générées
 * 
 * @example
 * ```tsx
 * import { PageTemplate } from '@/templates/PageTemplate';
 * 
 * export default function MaNouvellePage() {
 *   return (
 *     <PageTemplate
 *       title="Titre de la Page"
 *       description="Description optimisée pour le SEO"
 *       keywords={['mot-clé 1', 'mot-clé 2']}
 *       path="/ma-page"
 *     >
 *       {/* Contenu de la page */}
 *     </PageTemplate>
 *   );
 * }
 * ```
 */

import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import PremiumHeader from '@/components/layout/PremiumHeader';
import InstitutionalFooter from '@/components/public/InstitutionalFooter';

interface PageTemplateProps {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  image?: string;
  noIndex?: boolean;
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function generatePageMetadata(props: Omit<PageTemplateProps, 'children' | 'showHeader' | 'showFooter'>): Metadata {
  return generateSEOMetadata({
    title: props.title,
    description: props.description,
    keywords: props.keywords,
    path: props.path,
    image: props.image,
    noIndex: props.noIndex,
  });
}

export default function PageTemplate({
  title,
  description,
  keywords = [],
  path,
  image,
  noIndex = false,
  children,
  showHeader = true,
  showFooter = true,
}: PageTemplateProps) {
  return (
    <>
      {showHeader && <PremiumHeader />}
      <main className="min-h-screen bg-white">
        {children}
      </main>
      {showFooter && <InstitutionalFooter />}
    </>
  );
}

