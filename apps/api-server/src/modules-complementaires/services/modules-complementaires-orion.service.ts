import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CanteenService } from './canteen.service';
import { TransportService } from './transport.service';
import { LibraryService } from './library.service';
import { LabService } from './lab.service';
import { MedicalService } from './medical.service';
import { ShopService } from './shop.service';
import { EducastService } from './educast.service';

/**
 * Service d'intégration ORION pour le MODULE 9 — Modules Complémentaires
 */
@Injectable()
export class ModulesComplementairesOrionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly canteenService: CanteenService,
    private readonly transportService: TransportService,
    private readonly libraryService: LibraryService,
    private readonly labService: LabService,
    private readonly medicalService: MedicalService,
    private readonly shopService: ShopService,
    private readonly educastService: EducastService,
  ) {}

  /**
   * Génère tous les KPIs pour tous les sous-modules
   */
  async getAllKPIs(tenantId: string, academicYearId: string) {
    const [canteenStats, transportStats, libraryStats, labStats, medicalStats, shopStats, educastStats] =
      await Promise.all([
        this.canteenService.getAttendanceStats(tenantId, academicYearId),
        this.transportService.getTransportStats(tenantId, academicYearId),
        this.libraryService.getLibraryStats(tenantId, academicYearId),
        this.labService.getLabStats(tenantId, academicYearId),
        this.medicalService.getMedicalStats(tenantId, academicYearId),
        this.shopService.getShopStats(tenantId, academicYearId),
        this.educastService.getContentStats(tenantId, academicYearId),
      ]);

    return {
      canteen: {
        enrollmentRate: canteenStats.attendanceRate,
        attendanceRate: canteenStats.attendanceRate,
      },
      transport: {
        occupancyRate: transportStats.occupancyRate,
        attendanceRate: transportStats.attendanceRate,
      },
      library: {
        loanRate: libraryStats.loanRate,
        overdueRate: libraryStats.overdueLoans > 0 ? (libraryStats.overdueLoans / libraryStats.activeLoans) * 100 : 0,
      },
      labs: {
        utilizationRate: labStats.utilizationRate,
        equipmentMaintenanceRate:
          labStats.totalEquipment > 0
            ? (labStats.equipmentInMaintenance / labStats.totalEquipment) * 100
            : 0,
      },
      medical: {
        visitRate: medicalStats.totalVisits > 0 ? (medicalStats.totalVisits / medicalStats.totalRecords) * 100 : 0,
        criticalAlertsRate:
          medicalStats.totalRecords > 0 ? (medicalStats.criticalAlerts / medicalStats.totalRecords) * 100 : 0,
      },
      shop: {
        revenue: shopStats.totalRevenue,
        lowStockRate: shopStats.totalProducts > 0 ? (shopStats.lowStockProducts / shopStats.totalProducts) * 100 : 0,
      },
      educast: {
        completionRate: educastStats.completionRate,
        engagementRate:
          educastStats.totalContents > 0 ? (educastStats.totalViews / educastStats.totalContents) * 100 : 0,
      },
    };
  }

  /**
   * Génère les alertes ORION pour tous les sous-modules
   */
  async generateAlerts(tenantId: string, academicYearId: string) {
    const alerts: any[] = [];

    // Alerte Cantine : Taux de présence faible
    const canteenStats = await this.canteenService.getAttendanceStats(tenantId, academicYearId);
    if (canteenStats.total > 10 && canteenStats.attendanceRate < 70) {
      alerts.push({
        module: 'CANTINE',
        severity: 'WARNING',
        title: 'Taux de présence cantine faible',
        description: `Le taux de présence à la cantine est de ${canteenStats.attendanceRate.toFixed(1)}%.`,
        recommendation: 'Analyser les causes et améliorer la qualité des repas ou les horaires.',
      });
    }

    // Alerte Transport : Taux d'occupation faible
    const transportStats = await this.transportService.getTransportStats(tenantId, academicYearId);
    if (transportStats.occupancyRate < 60) {
      alerts.push({
        module: 'TRANSPORT',
        severity: 'INFO',
        title: 'Taux d\'occupation des véhicules faible',
        description: `Le taux d'occupation est de ${transportStats.occupancyRate.toFixed(1)}%.`,
        recommendation: 'Optimiser les itinéraires ou réduire le nombre de véhicules.',
      });
    }

    // Alerte Bibliothèque : Livres en retard
    const overdueLoans = await this.libraryService.getOverdueLoans(tenantId, academicYearId);
    if (overdueLoans.length > 5) {
      alerts.push({
        module: 'BIBLIOTHÈQUE',
        severity: 'WARNING',
        title: `${overdueLoans.length} emprunt(s) en retard`,
        description: `Il y a ${overdueLoans.length} livre(s) non retourné(s) après la date d'échéance.`,
        recommendation: 'Envoyer des rappels aux élèves et mettre à jour les pénalités.',
      });
    }

    // Alerte Laboratoires : Équipements à risque
    const labStats = await this.labService.getLabStats(tenantId, academicYearId);
    if (labStats.equipmentInMaintenance > labStats.totalEquipment * 0.2) {
      alerts.push({
        module: 'LABORATOIRES',
        severity: 'WARNING',
        title: 'Taux de maintenance élevé',
        description: `${labStats.equipmentInMaintenance} équipement(s) en maintenance sur ${labStats.totalEquipment}.`,
        recommendation: 'Planifier une maintenance préventive et revoir les procédures d\'utilisation.',
      });
    }

    // Alerte Infirmerie : Alertes critiques
    const criticalAlerts = await this.medicalService.getCriticalAlerts(tenantId, academicYearId);
    if (criticalAlerts.length > 0) {
      alerts.push({
        module: 'INFIRMERIE',
        severity: 'CRITICAL',
        title: `${criticalAlerts.length} alerte(s) médicale(s) critique(s)`,
        description: `Il y a ${criticalAlerts.length} alerte(s) médicale(s) non traitées.`,
        recommendation: 'Traiter immédiatement les alertes critiques et mettre à jour les dossiers médicaux.',
      });
    }

    // Alerte Boutique : Stock faible
    const shopStats = await this.shopService.getShopStats(tenantId, academicYearId);
    if (shopStats.lowStockProducts > 3) {
      alerts.push({
        module: 'BOUTIQUE',
        severity: 'INFO',
        title: `${shopStats.lowStockProducts} produit(s) en stock faible`,
        description: `${shopStats.lowStockProducts} produit(s) sont en dessous du seuil minimum.`,
        recommendation: 'Réapprovisionner les produits en stock faible.',
      });
    }

    // Alerte EduCast : Engagement faible
    const educastStats = await this.educastService.getContentStats(tenantId, academicYearId);
    if (educastStats.totalContents > 10 && educastStats.engagementRate < 30) {
      alerts.push({
        module: 'EDUCAST',
        severity: 'INFO',
        title: 'Taux d\'engagement EduCast faible',
        description: `Le taux d'engagement est de ${educastStats.engagementRate.toFixed(1)}%.`,
        recommendation: 'Promouvoir les contenus pédagogiques et améliorer leur accessibilité.',
      });
    }

    return alerts;
  }
}

