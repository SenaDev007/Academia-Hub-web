/**
 * Testimonials Section Component
 * 
 * Section témoignages pour la landing page
 * Affichage sobre et institutionnel
 */

'use client';

import { useEffect, useState } from 'react';
import type { Testimonial } from '@/types';
import { getPublishedTestimonials } from '@/services/testimonial.service';
import AppIcon from '@/components/ui/AppIcon';
import { bgColor, textColor, typo, radius, shadow } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TestimonialsSectionProps {
  limit?: number;
  featured?: boolean;
}

export default function TestimonialsSection({ limit = 3, featured = true }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await getPublishedTestimonials(featured, limit);
        setTestimonials(data);
      } catch (error) {
        console.error('Error loading testimonials:', error);
        // En cas d'erreur, on n'affiche pas la section
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadTestimonials();
  }, [featured, limit]);

  if (isLoading) {
    return (
      <section className={`py-16 ${bgColor('app')} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <AppIcon name="view" size="menu" className="text-graphite-500 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Ne pas afficher la section s'il n'y a pas de témoignages
  }

  return (
    <section className={`py-16 ${bgColor('app')} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className={`${typo('h2')} ${textColor('primary')} mb-4`}>
            Ce que disent les directeurs d'établissements
          </h2>
          <p className={`${typo('body-large')} ${textColor('secondary')} max-w-2xl mx-auto`}>
            Des témoignages authentiques d'établissements qui utilisent Academia Hub
            pour gérer leur direction scolaire avec rigueur et efficacité.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={cn(
                bgColor('card'),
                radius.card,
                shadow.card,
                'border border-gray-200 p-6 hover:shadow-card-hover transition-shadow'
              )}
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <AppIcon name="communication" size="menu" className="text-gold-500" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <AppIcon
                    key={i}
                    name={i < testimonial.rating ? "success" : "info"}
                    size="submenu"
                    className={i < testimonial.rating ? "text-gold-500" : "text-gray-300"}
                  />
                ))}
              </div>

              {/* Content */}
              <p className={`${typo('body')} ${textColor('secondary')} leading-relaxed mb-6 italic`}>
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                {testimonial.authorPhotoUrl ? (
                  <img
                    src={testimonial.authorPhotoUrl}
                    alt={testimonial.authorName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full ${bgColor('sidebar')} flex items-center justify-center`}>
                    <span className={`${typo('body-small')} text-white font-semibold`}>
                      {testimonial.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className={`${typo('body')} ${textColor('primary')} font-semibold`}>
                    {testimonial.authorName}
                  </p>
                  <p className={`${typo('body-small')} ${textColor('secondary')}`}>
                    {testimonial.authorFunction}
                  </p>
                  <p className={`${typo('caption')} ${textColor('muted')}`}>
                    {testimonial.schoolName}
                    {testimonial.schoolCity && `, ${testimonial.schoolCity}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/testimonials"
            className={cn(
              'inline-flex items-center font-semibold transition-colors',
              textColor('primary'),
              'hover:text-blue-700'
            )}
          >
            Voir tous les témoignages
            <AppIcon name="trends" size="action" className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}

