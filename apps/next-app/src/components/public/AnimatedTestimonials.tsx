'use client';

import { useState, useEffect } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { bgColor, textColor, typo, radius, shadow } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface TestimonialExample {
  content: string;
  authorName: string;
  authorFunction: string;
  schoolName: string;
  rating: number;
  type: 'director' | 'promoter';
}

const testimonialExamples: TestimonialExample[] = [
  {
    content: "Academia Hub a transformé notre gestion quotidienne. Tout est centralisé, accessible et sécurisé. Nous avons gagné un temps précieux sur les tâches administratives.",
    authorName: "Marie Kouassi",
    authorFunction: "Directrice",
    schoolName: "École Primaire Les Étoiles",
    rating: 5,
    type: 'director'
  },
  {
    content: "En tant que promoteur, j'ai besoin de visibilité sur tous mes établissements. Academia Hub me donne cette vision globale en temps réel, avec des rapports détaillés.",
    authorName: "Jean-Baptiste Traoré",
    authorFunction: "Promoteur",
    schoolName: "Groupe Scolaire Excellence",
    rating: 5,
    type: 'promoter'
  },
  {
    content: "La gestion des notes et examens est devenue un jeu d'enfant. Le système est intuitif et nos enseignants l'ont adopté rapidement. Les parents apprécient la transparence.",
    authorName: "Aminata Diallo",
    authorFunction: "Directrice",
    schoolName: "Collège Moderne",
    rating: 5,
    type: 'director'
  },
  {
    content: "L'aspect offline est crucial pour nous. Même sans internet, nous continuons à fonctionner normalement. C'est un avantage concurrentiel majeur.",
    authorName: "Ousmane Sarr",
    authorFunction: "Promoteur",
    schoolName: "Complexe Scolaire Horizon",
    rating: 5,
    type: 'promoter'
  },
  {
    content: "Les modules financiers sont complets et fiables. Nous avons une traçabilité parfaite de toutes nos opérations. La conformité est assurée.",
    authorName: "Fatou Ndiaye",
    authorFunction: "Directrice",
    schoolName: "Lycée International",
    rating: 5,
    type: 'director'
  },
];

export default function AnimatedTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonialExamples.length);
        setIsAnimating(false);
      }, 300); // Half of animation duration
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonialExamples[currentIndex];

  return (
    <div className="relative min-h-[400px] flex items-center justify-center">
      <div
        className={cn(
          'w-full transition-all duration-500 ease-in-out',
          isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        )}
      >
        <div
          className={cn(
            bgColor('card'),
            radius.card,
            shadow.card,
            'border-2 border-gold-500/20 p-10 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group'
          )}
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/5 rounded-tr-full"></div>
          
          <div className="relative z-10">
            {/* Quote Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-2xl border border-gold-500/30">
                <AppIcon name="communication" size="menu" className="text-gold-500" />
              </div>
            </div>

            {/* Badge for type */}
            <div className="mb-4">
              <span className={cn(
                'inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold',
                currentTestimonial.type === 'director' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-purple-100 text-purple-700 border border-purple-300'
              )}>
                <AppIcon 
                  name={currentTestimonial.type === 'director' ? 'user' : 'building'} 
                  size="submenu" 
                  className="mr-2" 
                />
                {currentTestimonial.type === 'director' ? 'Directeur' : 'Promoteur'}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-6">
              {[...Array(5)].map((_, i) => (
                <AppIcon
                  key={i}
                  name="success"
                  size="submenu"
                  className={cn(
                    "transition-all duration-300",
                    i < currentTestimonial.rating 
                      ? "text-gold-500 scale-110" 
                      : "text-gray-300"
                  )}
                  style={{
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <p className={cn(
              typo('large'),
              textColor('primary'),
              'leading-relaxed mb-8 italic text-lg'
            )}>
              "{currentTestimonial.content}"
            </p>

            {/* Author */}
            <div className="flex items-center space-x-5 pt-6 border-t-2 border-gold-500/20">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg',
                currentTestimonial.type === 'director'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                  : 'bg-gradient-to-br from-purple-600 to-purple-700'
              )}>
                {currentTestimonial.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className={cn(typo('h4'), textColor('primary'), 'font-bold mb-1')}>
                  {currentTestimonial.authorName}
                </p>
                <p className={cn(typo('base'), textColor('secondary'), 'font-semibold mb-1')}>
                  {currentTestimonial.authorFunction}
                </p>
                <p className={cn(typo('small'), textColor('muted'))}>
                  {currentTestimonial.schoolName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {testimonialExamples.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAnimating(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsAnimating(false);
              }, 300);
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'bg-gold-500 w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

