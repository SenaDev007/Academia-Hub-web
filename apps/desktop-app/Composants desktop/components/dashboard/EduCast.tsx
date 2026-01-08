import React, { useState } from 'react';
import { 
  Video, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Users,
  Play,
  Pause,
  Settings,
  Edit,
  Eye,
  Download,
  Trash2,
  BarChart3,
  TrendingUp,
  Brain,
  BookOpen,
  MessageSquare,
  Sparkles,
  Upload,
  Clock,
  CheckCircle,
  Star,
  Bookmark,
  PenTool,
  Layers,
  HelpCircle,
  Share2,
  FileText,
  Zap,
  Award,
  Mic,
  User,
  Lightbulb
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { useDropzone } from 'react-dropzone';

const EduCast: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [selectedVoice, setSelectedVoice] = useState('female1');
  const [courseScript, setCourseScript] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubject, setCourseSubject] = useState('');
  const [courseLevel, setCourseLevel] = useState('');
  const [courseInteractions, setCourseInteractions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [messageInput, setMessageInput] = useState('');

  // Données fictives pour les statistiques
  const educastStats = [
    {
      title: 'Cours créés',
      value: '124',
      change: '+15',
      icon: Video,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Visionnages',
      value: '3,847',
      change: '+12%',
      icon: Play,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Taux d\'engagement',
      value: '87.5%',
      change: '+3.2%',
      icon: TrendingUp,
      color: 'from-purple-600 to-purple-700'
    },
    {
      title: 'Temps moyen',
      value: '18:45',
      change: '+2:12',
      icon: Clock,
      color: 'from-orange-600 to-orange-700'
    }
  ];

  // Données fictives pour les cours
  const courses = [
    {
      id: 'course-001',
      title: 'Introduction à l\'algèbre linéaire',
      subject: 'Mathématiques',
      level: 'Terminale S',
      thumbnail: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      duration: '24:15',
      views: 245,
      rating: 4.8,
      createdAt: '2024-01-15',
      status: 'published',
      interactions: 56,
      avatar: 'avatar1',
      teacher: 'M. Dubois'
    },
    {
      id: 'course-002',
      title: 'La Révolution Française',
      subject: 'Histoire',
      level: '4ème',
      thumbnail: 'https://images.pexels.com/photos/5428258/pexels-photo-5428258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      duration: '18:30',
      views: 189,
      rating: 4.5,
      createdAt: '2024-01-12',
      status: 'published',
      interactions: 42,
      avatar: 'avatar2',
      teacher: 'Mme Martin'
    },
    {
      id: 'course-003',
      title: 'Les réactions chimiques',
      subject: 'Chimie',
      level: '3ème',
      thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      duration: '15:45',
      views: 156,
      rating: 4.6,
      createdAt: '2024-01-10',
      status: 'published',
      interactions: 38,
      avatar: 'avatar3',
      teacher: 'M. Bernard'
    },
    {
      id: 'course-004',
      title: 'Grammaire anglaise - Les temps',
      subject: 'Anglais',
      level: '5ème',
      thumbnail: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      duration: '22:10',
      views: 178,
      rating: 4.7,
      createdAt: '2024-01-08',
      status: 'draft',
      interactions: 0,
      avatar: 'avatar4',
      teacher: 'Mme Petit'
    }
  ];

  // Données fictives pour les avatars
  const avatars = [
    { id: 'avatar1', name: 'Professeur Thomas', gender: 'male', style: 'formal', thumbnail: 'https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'avatar2', name: 'Professeure Marie', gender: 'female', style: 'formal', thumbnail: 'https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'avatar3', name: 'Dr. Laurent', gender: 'male', style: 'casual', thumbnail: 'https://images.pexels.com/photos/8851636/pexels-photo-8851636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { id: 'avatar4', name: 'Mme Sophie', gender: 'female', style: 'casual', thumbnail: 'https://images.pexels.com/photos/8851635/pexels-photo-8851635.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }
  ];

  // Données fictives pour les voix
  const voices = [
    { id: 'male1', name: 'Voix Masculine 1', gender: 'male', language: 'Français', sample: '#' },
    { id: 'male2', name: 'Voix Masculine 2', gender: 'male', language: 'Français', sample: '#' },
    { id: 'female1', name: 'Voix Féminine 1', gender: 'female', language: 'Français', sample: '#' },
    { id: 'female2', name: 'Voix Féminine 2', gender: 'female', language: 'Français', sample: '#' }
  ];

  // Données fictives pour les matières
  const subjects = [
    'Mathématiques', 'Physique', 'Chimie', 'SVT', 'Histoire', 'Géographie', 
    'Français', 'Anglais', 'Espagnol', 'Philosophie', 'Éducation civique', 'Arts plastiques'
  ];

  // Données fictives pour les niveaux
  const levels = [
    'CP', 'CE1', 'CE2', 'CM1', 'CM2', 
    '6ème', '5ème', '4ème', '3ème', 
    '2nde', '1ère', 'Terminale'
  ];

  // Données fictives pour les statistiques d'utilisation
  const usageStats = {
    totalViews: 12450,
    totalHours: 2345,
    averageCompletion: 87,
    topSubjects: [
      { name: 'Mathématiques', percentage: 35 },
      { name: 'Sciences', percentage: 28 },
      { name: 'Langues', percentage: 22 },
      { name: 'Histoire-Géo', percentage: 15 }
    ],
    weeklyTrend: [
      { day: 'Lun', views: 450 },
      { day: 'Mar', views: 520 },
      { day: 'Mer', views: 380 },
      { day: 'Jeu', views: 490 },
      { day: 'Ven', views: 580 },
      { day: 'Sam', views: 320 },
      { day: 'Dim', views: 280 }
    ]
  };

  // Données fictives pour les insights IA
  const aiInsights = [
    {
      title: 'Optimisation du temps d\'attention',
      description: 'Les vidéos de 12-15 minutes ont le meilleur taux de complétion',
      recommendation: 'Privilégiez des vidéos courtes et ciblées',
      confidence: 92
    },
    {
      title: 'Engagement par niveau',
      description: 'Les élèves de 4ème montrent le plus d\'interactions',
      recommendation: 'Créez plus de contenu interactif pour ce niveau',
      confidence: 87
    },
    {
      title: 'Sujets à développer',
      description: 'Forte demande en contenus de sciences expérimentales',
      recommendation: 'Augmentez la production de vidéos de chimie et physique',
      confidence: 94
    }
  ];

  // Fonctions pour la gestion du dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf']
    },
    onDrop: (acceptedFiles) => {
      // Simuler l'importation d'un script
      setTimeout(() => {
        setCourseScript('Contenu importé depuis ' + acceptedFiles[0].name);
      }, 1000);
    }
  });

  // Fonction pour ajouter une interaction au cours
  const addInteraction = (type: string) => {
    const newInteraction = {
      id: `interaction-${Date.now()}`,
      type,
      time: currentVideoTime,
      content: type === 'quiz' ? {
        question: 'Question du quiz',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 0
      } : type === 'poll' ? {
        question: 'Question du sondage',
        options: ['Option 1', 'Option 2', 'Option 3']
      } : {
        text: 'Contenu de l\'interaction'
      }
    };
    
    setCourseInteractions([...courseInteractions, newInteraction]);
  };

  // Fonction pour simuler la génération d'un cours
  const generateCourse = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simuler la progression
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          // Simuler la fin de la génération
          setTimeout(() => {
            setIsCreatingCourse(false);
            setIsPreviewMode(false);
            setActiveTab('mycourses');
          }, 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  // Fonction pour envoyer un message au chatbot
  const sendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Ajouter le message de l'utilisateur
    setChatMessages([...chatMessages, { role: 'user', content: messageInput }]);
    setMessageInput('');
    
    // Simuler une réponse de l'IA après un court délai
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Voici une explication sur ce point du cours : "${messageInput}". N'hésitez pas à me poser d'autres questions.` 
      }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">EduCast IA</h1>
          <p className="text-gray-600 dark:text-gray-400">Création et diffusion de cours vidéo animés par IA</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button 
            onClick={() => {
              setIsCreatingCourse(true);
              setActiveTab('create');
              setCurrentStep(1);
            }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau cours
          </button>
        </div>
      </div>

      {/* Statistics */}
      {!isCreatingCourse && !isPreviewMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {educastStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      {!isCreatingCourse && !isPreviewMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
                { id: 'mycourses', label: 'Mes cours', icon: Video },
                { id: 'library', label: 'Bibliothèque', icon: BookOpen },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'insights', label: 'Insights IA', icon: Brain }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tableau de bord EduCast</h3>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Cette semaine
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Activité récente</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Cours les plus visionnés</h5>
                      <div className="space-y-3">
                        {courses.slice(0, 3).map((course, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100">{course.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{course.subject} • {course.views} vues</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Statistiques d'utilisation</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">Vues totales</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{usageStats.totalViews}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">Heures visionnées</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{usageStats.totalHours}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 dark:text-gray-300">Taux de complétion</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">{usageStats.averageCompletion}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Access */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => {
                      setIsCreatingCourse(true);
                      setActiveTab('create');
                      setCurrentStep(1);
                    }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Créer un cours</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Générez un nouveau cours vidéo avec IA</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('library')}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mb-3">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Explorer la bibliothèque</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Découvrez les cours disponibles</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-3">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Consulter les analytics</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Analysez l'impact de vos cours</p>
                  </button>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                      Insights IA
                    </h4>
                    <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                      Voir tous les insights
                    </button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-900/30">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{insight.title}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-600 dark:text-purple-400">Confiance: {insight.confidence}%</span>
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mycourses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Mes cours</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Rechercher un cours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">Toutes les matières</option>
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses
                    .filter(course => 
                      (selectedCategory === 'all' || course.subject === selectedCategory) &&
                      (searchTerm === '' || course.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((course, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="relative h-40">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {course.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{course.title}</h4>
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">
                              {course.subject}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {course.level} • {course.views} vues • {course.teacher}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-sm font-medium">{course.rating}</span>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setIsPreviewMode(true)}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'library' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Bibliothèque de cours</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Rechercher un cours..."
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtres
                    </button>
                  </div>
                </div>

                {/* Featured Courses */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Cours recommandés par l'IA</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    {courses.slice(0, 3).map((course, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative h-32">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {course.duration}
                          </div>
                        </div>
                        <div className="p-3">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{course.title}</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {course.subject} • {course.level}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              <span className="text-xs font-medium">{course.rating}</span>
                            </div>
                            <button 
                              onClick={() => setIsPreviewMode(true)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              Visionner
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Categories */}
                <div className="space-y-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">Parcourir par matière</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {subjects.slice(0, 8).map((subject, index) => (
                      <div 
                        key={index} 
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-gradient-to-r ${
                            index % 4 === 0 ? 'from-blue-600 to-indigo-600' :
                            index % 4 === 1 ? 'from-green-600 to-teal-600' :
                            index % 4 === 2 ? 'from-purple-600 to-pink-600' :
                            'from-orange-600 to-red-600'
                          }`}>
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">{subject}</h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Math.floor(Math.random() * 50) + 10} cours
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Analytics des cours</h3>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Ce mois
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Download className="w-4 h-4 mr-2" />
                      Exporter
                    </button>
                  </div>
                </div>

                {/* Overview Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Vue d'ensemble</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total vues</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{usageStats.totalViews}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Heures visionnées</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{usageStats.totalHours}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Taux de complétion</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{usageStats.averageCompletion}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Répartition par matière</h4>
                    <div className="space-y-3">
                      {usageStats.topSubjects.map((subject, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{subject.name}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{subject.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                index % 4 === 0 ? 'bg-blue-600' :
                                index % 4 === 1 ? 'bg-green-600' :
                                index % 4 === 2 ? 'bg-purple-600' :
                                'bg-orange-600'
                              }`}
                              style={{ width: `${subject.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tendance hebdomadaire</h4>
                    <div className="h-40 flex items-end justify-between">
                      {usageStats.weeklyTrend.map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-8 bg-blue-600 dark:bg-blue-500 rounded-t"
                            style={{ height: `${(day.views / 600) * 100}%` }}
                          ></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{day.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Course Performance */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Performance des cours</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cours
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Vues
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Temps moyen
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Complétion
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Interactions
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Note
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {courses.map((course, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden">
                                  <img src={course.thumbnail} alt={course.title} className="h-10 w-10 object-cover" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{course.title}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{course.subject} • {course.level}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {course.views}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {Math.floor(Math.random() * 10) + 5}:
                              {Math.floor(Math.random() * 60).toString().padStart(2, '0')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                  {Math.floor(Math.random() * 30) + 70}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {course.interactions}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{course.rating}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Insights IA</h3>
                  <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700">
                    <Brain className="w-4 h-4 mr-2" />
                    Générer nouveaux insights
                  </button>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Recommandations IA personnalisées</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Basées sur l'analyse de vos 124 cours et 3,847 visionnages d'élèves
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        {aiInsights.map((insight, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-900/30">
                            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{insight.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                              <p className="text-sm text-purple-700 dark:text-purple-300">
                                <Lightbulb className="w-4 h-4 inline mr-1" />
                                {insight.recommendation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Optimization */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Optimisation du contenu</h4>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Durée optimale des vidéos</h5>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">12-15 min</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Les vidéos de 12-15 minutes montrent un taux de complétion 24% plus élevé que les vidéos plus longues.
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">Interactivité</h5>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full w-2/3"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">3-5 quiz</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Les cours avec 3-5 quiz intégrés ont un taux d'engagement 37% supérieur aux cours sans interactivité.
                      </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <h5 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Rythme de parole</h5>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full w-4/5"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">130-150 mots/min</span>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-400">
                        Un rythme de 130-150 mots par minute est optimal pour la compréhension et la rétention des informations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Engagement */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Engagement des élèves</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Moments d'attention</h5>
                      <div className="h-40 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-end p-2">
                        {/* Simuler un graphique d'attention */}
                        {Array.from({ length: 20 }).map((_, index) => (
                          <div 
                            key={index} 
                            className="w-full bg-blue-600 dark:bg-blue-500 rounded-t mx-0.5"
                            style={{ 
                              height: `${Math.sin(index / 3) * 50 + 50}%`,
                              opacity: index % 5 === 0 ? 1 : 0.7
                            }}
                          ></div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        L'attention est maximale dans les 5 premières minutes et après chaque interaction.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Questions fréquentes</h5>
                      <div className="space-y-2">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-medium">
                            "Pouvez-vous expliquer à nouveau la formule ?"
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Demandé 24 fois dans les cours de mathématiques
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-medium">
                            "Quelle est la différence entre X et Y ?"
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Demandé 18 fois dans divers cours
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-medium">
                            "Pouvez-vous donner un exemple concret ?"
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Demandé 15 fois dans les cours de sciences
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Creation Workflow */}
      {isCreatingCourse && !isPreviewMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: 'Configuration' },
                { step: 2, label: 'Contenu' },
                { step: 3, label: 'Interactivité' },
                { step: 4, label: 'Génération' }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === item.step 
                        ? 'bg-blue-600 text-white' 
                        : currentStep > item.step 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {currentStep > item.step ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      item.step
                    )}
                  </div>
                  <span className={`text-sm mt-2 ${
                    currentStep === item.step 
                      ? 'text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-2">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700"></div>
              <div 
                className="absolute top-0 left-0 h-1 bg-blue-600" 
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Configuration */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configuration du cours</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Commençons par configurer les paramètres de base de votre cours vidéo.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Titre du cours*
                    </label>
                    <input
                      type="text"
                      id="courseTitle"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Ex: Introduction à la photosynthèse"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="courseSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Matière*
                    </label>
                    <select
                      id="courseSubject"
                      value={courseSubject}
                      onChange={(e) => setCourseSubject(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Sélectionner une matière</option>
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="courseLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Niveau*
                    </label>
                    <select
                      id="courseLevel"
                      value={courseLevel}
                      onChange={(e) => setCourseLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      <option value="">Sélectionner un niveau</option>
                      {levels.map((level, index) => (
                        <option key={index} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Avatar IA*
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {avatars.map((avatar) => (
                        <div 
                          key={avatar.id}
                          onClick={() => setSelectedAvatar(avatar.id)}
                          className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedAvatar === avatar.id 
                              ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          <img 
                            src={avatar.thumbnail} 
                            alt={avatar.name} 
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2 bg-white dark:bg-gray-800">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{avatar.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {avatar.gender === 'male' ? 'Masculin' : 'Féminin'} • {avatar.style}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Voix IA*
                    </label>
                    <div className="space-y-2">
                      {voices.map((voice) => (
                        <div 
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-between ${
                            selectedVoice === voice.id 
                              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{voice.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {voice.gender === 'male' ? 'Masculine' : 'Féminine'} • {voice.language}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full">
                              <Play className="w-4 h-4" />
                            </button>
                            {selectedVoice === voice.id && (
                              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setIsCreatingCourse(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!courseTitle || !courseSubject || !courseLevel || !selectedAvatar || !selectedVoice}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contenu du cours</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Rédigez ou importez le script de votre cours. Notre IA transformera ce texte en vidéo.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="courseScript" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Script du cours*
                    </label>
                    <textarea
                      id="courseScript"
                      value={courseScript}
                      onChange={(e) => setCourseScript(e.target.value)}
                      rows={12}
                      placeholder="Saisissez le contenu de votre cours ici..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ou importez un document
                    </label>
                    <div 
                      {...getRootProps()} 
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Glissez-déposez un fichier ici, ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Formats supportés: TXT, DOCX, PDF
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Suggestions IA
                    </label>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-900/30">
                      <div className="flex items-center mb-3">
                        <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <h5 className="font-medium text-purple-900 dark:text-purple-300">Assistant IA</h5>
                      </div>
                      <div className="space-y-3">
                        <button className="w-full text-left p-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:shadow-sm transition-shadow">
                          Générer une introduction captivante
                        </button>
                        <button className="w-full text-left p-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:shadow-sm transition-shadow">
                          Ajouter des exemples concrets
                        </button>
                        <button className="w-full text-left p-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:shadow-sm transition-shadow">
                          Simplifier le vocabulaire pour le niveau {courseLevel}
                        </button>
                        <button className="w-full text-left p-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:shadow-sm transition-shadow">
                          Ajouter une conclusion récapitulative
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Templates disponibles
                    </label>
                    <div className="space-y-2">
                      <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Introduction à un concept</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Structure: définition, exemples, applications</p>
                          </div>
                        </div>
                      </button>
                      <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                            <PenTool className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Résolution de problème</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Structure: énoncé, méthode, solution étape par étape</p>
                          </div>
                        </div>
                      </button>
                      <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
                            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Comparaison de concepts</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Structure: similitudes, différences, applications</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between space-x-3 mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Retour
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!courseScript.trim()}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Interactivity */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Interactivité</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ajoutez des éléments interactifs pour rendre votre cours plus engageant.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Prévisualisation</h4>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center mb-3">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Prévisualisation non disponible
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          La vidéo sera générée à l'étape suivante
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                          <Play className="w-4 h-4" />
                        </button>
                        <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div className="bg-blue-600 h-1 rounded-full w-0"></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">00:00</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Éléments interactifs ajoutés
                    </label>
                    {courseInteractions.length > 0 ? (
                      <div className="space-y-2">
                        {courseInteractions.map((interaction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                interaction.type === 'quiz' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                interaction.type === 'poll' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                              }`}>
                                {interaction.type === 'quiz' ? '?' :
                                 interaction.type === 'poll' ? '◯' : '!'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {interaction.type === 'quiz' ? 'Quiz' :
                                   interaction.type === 'poll' ? 'Sondage' : 'Point d\'information'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  À {Math.floor(interaction.time / 60)}:{(interaction.time % 60).toString().padStart(2, '0')}
                                </p>
                              </div>
                            </div>
                            <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">
                          Aucun élément interactif ajouté
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          Utilisez les boutons ci-contre pour ajouter des interactions
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ajouter des interactions
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => addInteraction('quiz')}
                        className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                          <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Quiz interactif</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ajoutez des questions à choix multiples pour tester les connaissances
                          </p>
                        </div>
                        <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </button>

                      <button 
                        onClick={() => addInteraction('poll')}
                        className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Sondage</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Recueillez l'opinion des élèves pendant le cours
                          </p>
                        </div>
                        <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </button>

                      <button 
                        onClick={() => addInteraction('info')}
                        className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                          <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">Point d'information</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ajoutez des informations complémentaires ou des ressources
                          </p>
                        </div>
                        <Plus className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <h5 className="font-medium text-blue-900 dark:text-blue-300">Recommandations IA</h5>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                      Basé sur l'analyse de votre script, voici nos suggestions :
                    </p>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-sm">
                        Ajoutez un quiz à 5:30 pour vérifier la compréhension du concept principal
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-sm">
                        Insérez un point d'information à 8:15 pour donner un exemple concret
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-sm">
                        Terminez par un sondage pour recueillir les impressions des élèves
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between space-x-3 mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Retour
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Generation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Génération du cours</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vérifiez les détails et lancez la génération de votre cours vidéo.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Récapitulatif</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Titre:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{courseTitle || 'Non défini'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Matière:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{courseSubject || 'Non définie'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Niveau:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{courseLevel || 'Non défini'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Avatar:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {avatars.find(a => a.id === selectedAvatar)?.name || 'Non défini'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Voix:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {voices.find(v => v.id === selectedVoice)?.name || 'Non définie'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Interactions:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{courseInteractions.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {isGenerating ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                    Génération en cours
                  </h4>
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {generationProgress < 25 ? 'Analyse du script...' :
                         generationProgress < 50 ? 'Génération de l\'audio...' :
                         generationProgress < 75 ? 'Création de la vidéo...' :
                         'Finalisation...'}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{generationProgress}%</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      La génération peut prendre quelques minutes. Vous recevrez une notification une fois terminée.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Options de génération</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Générer des sous-titres automatiques</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Optimiser pour la qualité vidéo (plus long)</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Publier automatiquement une fois généré</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-between space-x-3 mt-8">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={isGenerating}
                >
                  Retour
                </button>
                {isGenerating ? (
                  <button
                    className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800"
                  >
                    Annuler la génération
                  </button>
                ) : (
                  <button
                    onClick={generateCourse}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Générer le cours
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Preview Mode */}
      {isPreviewMode && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative">
            {/* Video Player */}
            <div className="aspect-video bg-black">
              <ReactPlayer
                url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Placeholder URL
                width="100%"
                height="100%"
                playing={isPlaying}
                controls={false}
                playbackRate={playbackSpeed}
                onProgress={(state) => setCurrentVideoTime(state.playedSeconds)}
                config={{
                  youtube: {
                    playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
                  }
                }}
              />
              
              {/* Custom Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    
                    <div className="w-48 md:w-96 bg-white/30 rounded-full h-1 cursor-pointer">
                      <div 
                        className="bg-blue-600 h-1 rounded-full" 
                        style={{ width: '35%' }}
                      ></div>
                    </div>
                    
                    <span className="text-xs text-white">08:45 / 24:15</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="bg-transparent text-white text-xs border-none focus:ring-0"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="1">1x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                    
                    <button 
                      onClick={() => setShowSubtitles(!showSubtitles)}
                      className={`p-1 rounded-full ${showSubtitles ? 'text-blue-400' : 'text-white'} hover:bg-white/20 transition-colors`}
                    >
                      <span className="text-xs font-bold">CC</span>
                    </button>
                    
                    <button 
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1 text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isFullscreen ? (
                          <>
                            <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                            <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                            <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                            <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                          </>
                        ) : (
                          <>
                            <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                            <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                            <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                            <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Subtitles */}
              {showSubtitles && (
                <div className="absolute bottom-16 left-0 right-0 text-center">
                  <div className="inline-block bg-black/70 text-white px-4 py-1 rounded-lg text-sm">
                    Ceci est un exemple de sous-titres pour la vidéo.
                  </div>
                </div>
              )}
            </div>
            
            {/* Video Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Introduction à l'algèbre linéaire</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Mathématiques • Terminale S • M. Dubois
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50">
                    <Bookmark className="w-4 h-4 mr-1" />
                    Sauvegarder
                  </button>
                  <button className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50">
                    <Share2 className="w-4 h-4 mr-1" />
                    Partager
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Ce cours présente les concepts fondamentaux de l'algèbre linéaire, incluant les vecteurs, les matrices et les systèmes d'équations linéaires. Vous apprendrez à manipuler ces objets mathématiques et à comprendre leurs applications dans divers domaines.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                    <textarea
                      placeholder="Prenez des notes pendant le visionnage..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    ></textarea>
                  </div>
                </div>
                
                <div>
                  <button 
                    onClick={() => setShowChatbot(!showChatbot)}
                    className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 flex items-center justify-center"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Assistant IA
                  </button>
                  
                  {showChatbot && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3">
                        <div className="flex items-center">
                          <Brain className="w-5 h-5 mr-2" />
                          <h5 className="font-medium">Assistant IA</h5>
                        </div>
                      </div>
                      
                      <div className="h-60 overflow-y-auto p-3 space-y-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-2 rounded-lg text-sm max-w-[80%]">
                          Bonjour ! Je suis votre assistant pour ce cours. Posez-moi des questions sur le contenu.
                        </div>
                        
                        {chatMessages.map((msg, index) => (
                          <div 
                            key={index} 
                            className={`${
                              msg.role === 'user' 
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 ml-auto' 
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            } p-2 rounded-lg text-sm max-w-[80%]`}
                          >
                            {msg.content}
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Posez une question..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          />
                          <button 
                            onClick={sendMessage}
                            className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Ressources complémentaires</h4>
                    <div className="space-y-2">
                      <a href="#" className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Fiche de synthèse (PDF)</span>
                      </a>
                      <a href="#" className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <FileText className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Exercices pratiques</span>
                      </a>
                      <a href="#" className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Liens externes</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Retour
                </button>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cours suivant
                  </button>
                  <button className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800">
                    Marquer comme terminé
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EduCast;