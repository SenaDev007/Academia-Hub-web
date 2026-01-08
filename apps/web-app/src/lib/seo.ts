/**
 * SEO Utilities
 * 
 * Fonctions utilitaires pour le SEO
 */

import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.academiahub.com';
const defaultImage = '/images/logo-Academia Hub.png';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  noIndex?: boolean;
}

/**
 * Génère les métadonnées SEO complètes pour une page
 */
export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    path = '',
    image = defaultImage,
    noIndex = false,
  } = config;

  const fullTitle = title.includes('Academia Hub') ? title : `${title} | Academia Hub`;
  const url = `${baseUrl}${path}`;

  return {
    title: fullTitle,
    description,
    keywords: [
      'gestion scolaire',
      'logiciel école',
      'plateforme SaaS éducation',
      'Academia Hub',
      ...keywords,
    ],
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Academia Hub',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Génère le JSON-LD structured data pour une organisation
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Academia Hub',
    url: baseUrl,
    logo: `${baseUrl}${defaultImage}`,
    description: 'Plateforme SaaS complète de gestion scolaire pour établissements privés en Afrique',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BJ',
      addressRegion: 'Afrique de l\'Ouest',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Support',
      email: 'support@academiahub.com',
    },
    sameAs: [
      'https://facebook.com/academiahub',
      'https://linkedin.com/company/academiahub',
      'https://twitter.com/academiahub',
      'https://youtube.com/@academiahub',
    ],
  };
}

/**
 * Génère le JSON-LD structured data pour un SoftwareApplication
 */
export function generateSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Academia Hub',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '15000',
      priceCurrency: 'XOF',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '85',
    },
  };
}

