import React from 'react';
import { 
  Users, DollarSign, Clock, TrendingUp, FileCheck, 
  Building2, Calendar, AlertTriangle 
} from 'lucide-react';
import { Contract } from '../../services/hrService';

interface ContractStatsProps {
  contracts: Contract[];
}

const ContractStats: React.FC<ContractStatsProps> = ({ contracts }) => {
  const stats = React.useMemo(() => {
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const permanentContracts = contracts.filter(c => c.contractType === 'permanent').length;
    const vacataireContracts = contracts.filter(c => c.contractType === 'vacataire').length;
    
    const totalBaseSalary = contracts.reduce((sum, c) => sum + (c.baseSalary || 0), 0);
    const averageSalary = totalContracts > 0 ? totalBaseSalary / totalContracts : 0;
    
    const cnssDeclared = contracts.filter(c => c.cnssDeclaration).length;
    const irppDeclared = contracts.filter(c => c.irppDeclaration).length;
    
    const contractsEndingSoon = contracts.filter(c => {
      if (!c.endDate) return false;
      const endDate = new Date(c.endDate);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;
    
    const totalBenefits = contracts.reduce((sum, c) => {
      return sum + (c.housingAllowance || 0) + (c.transportAllowance || 0) + (c.fixedBonuses || 0);
    }, 0);

    return {
      totalContracts,
      activeContracts,
      permanentContracts,
      vacataireContracts,
      averageSalary,
      cnssDeclared,
      irppDeclared,
      contractsEndingSoon,
      totalBenefits
    };
  }, [contracts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total des contrats',
      value: stats.totalContracts,
      icon: Users,
      color: 'blue',
      bgColor: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Contrats actifs',
      value: stats.activeContracts,
      icon: FileCheck,
      color: 'green',
      bgColor: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Permanents',
      value: stats.permanentContracts,
      icon: Building2,
      color: 'purple',
      bgColor: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Vacataires',
      value: stats.vacataireContracts,
      icon: Clock,
      color: 'orange',
      bgColor: 'from-orange-500 to-amber-600',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Salaire moyen',
      value: formatCurrency(stats.averageSalary),
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Avantages totaux',
      value: formatCurrency(stats.totalBenefits),
      icon: TrendingUp,
      color: 'cyan',
      bgColor: 'from-cyan-500 to-blue-600',
      textColor: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      title: 'Déclarés CNSS',
      value: stats.cnssDeclared,
      icon: FileCheck,
      color: 'indigo',
      bgColor: 'from-indigo-500 to-purple-600',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Fin proche (30j)',
      value: stats.contractsEndingSoon,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'from-red-500 to-pink-600',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContractStats;
