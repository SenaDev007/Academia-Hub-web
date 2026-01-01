import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import styles from './AnimatedHero.module.css';

const AnimatedHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useUser();

  const slides = [
    {
      className: styles.heroSlide1,
      quote: "L'éducation est l'arme la plus puissante pour changer le monde",
      author: "Nelson Mandela",
      subtitle: "Transformez l'avenir grâce à l'éducation digitale"
    },
    {
      className: styles.heroSlide2,
      quote: "Un enfant, un enseignant, un livre et un stylo peuvent changer le monde",
      author: "Malala Yousafzai",
      subtitle: "Chaque élève mérite une éducation de qualité"
    },
    {
      className: styles.heroSlide3,
      quote: "L'investissement dans l'éducation est l'investissement le plus rentable",
      author: "Benjamin Franklin",
      subtitle: "Digitalisez votre établissement avec notre IA"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${slide.className} absolute inset-0 bg-cover bg-center transition-all duration-1500 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
            }`}
            {...(index !== currentSlide && { 'aria-hidden': true })}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`${styles.floatingElement}`}
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${10 + (i * 12)}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center text-white px-4 max-w-6xl mx-auto transition-all duration-1000 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="mb-8">
          <span className="inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
            🎓 Solution #1 en Afrique de l'Ouest
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="block font-extrabold tracking-[-0.02em] bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Academia Hub
          </span>
          <span className="block mt-4 text-3xl md:text-5xl font-light text-white/90 leading-snug">
            {slides[currentSlide].subtitle}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
          Plateforme intelligente de gestion scolaire avec IA intégrée. 
          Digitalisation complète pour tous niveaux d'éducation - de la maternelle à l'université.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Link 
            to="/register/flow" 
            className="group bg-gradient-to-r from-white to-blue-50 text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:from-blue-50 hover:to-white transition-all duration-500 flex items-center shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105"
          >
            <span className="mr-3">🚀</span>
            Commencer l'essai gratuit
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
          
          <Link 
            to={isAuthenticated ? "/dashboard" : "/login"}
            className={`group px-10 py-5 rounded-2xl font-bold text-lg flex items-center shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 ${
              isAuthenticated 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-2 border-purple-400/30"
                : "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 border-2 border-gray-500/30"
            }`}
          >
            <span className="mr-3">{isAuthenticated ? "⚡" : "🔐"}</span>
            {isAuthenticated ? "Accès Dashboard" : "Se connecter"}
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
          
          <Link 
            to="#demo" 
            className="group text-white px-10 py-5 rounded-2xl font-bold text-lg border-2 border-white/30 hover:border-white/50 hover:bg-white/10 hover:text-white transition-all duration-500 flex items-center backdrop-blur-sm"
          >
            <span className="mr-3">▶️</span>
            Voir la démo
          </Link>
        </div>

        {/* Citations en dessous des boutons */}
        <div className="mt-16 max-w-4xl mx-auto">
          <blockquote className="quoteAnimation">
            <p className="text-2xl md:text-4xl font-light italic leading-relaxed mb-4 text-white/95">
              "{slides[currentSlide].quote}"
            </p>
            <cite className="text-xl md:text-2xl font-medium opacity-90 text-white/80">
              — {slides[currentSlide].author}
            </cite>
          </blockquote>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Aller à la diapositive ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70 animate-bounce">
        <ChevronDown className="w-8 h-8" />
      </div>
    </section>
  );
};

export default AnimatedHero;
