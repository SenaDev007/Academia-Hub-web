/**
 * Structured Data Component
 * 
 * Ajoute les données structurées JSON-LD pour le SEO
 * Composant serveur uniquement (pas de 'use client')
 */

import { generateOrganizationSchema, generateSoftwareApplicationSchema } from '@/lib/seo';

export default function StructuredData() {
  const organizationSchema = generateOrganizationSchema();
  const softwareSchema = generateSoftwareApplicationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}

