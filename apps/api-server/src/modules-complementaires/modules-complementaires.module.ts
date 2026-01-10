import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CanteenService } from './services/canteen.service';
import { TransportService } from './services/transport.service';
import { LibraryService } from './services/library.service';
import { LabService } from './services/lab.service';
import { MedicalService } from './services/medical.service';
import { ShopService } from './services/shop.service';
import { EducastService } from './services/educast.service';
import { ModulesComplementairesOrionService } from './services/modules-complementaires-orion.service';
import { ModulesComplementairesController } from './modules-complementaires.controller';

/**
 * Module pour le MODULE 9 — Modules Complémentaires
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ModulesComplementairesController],
  providers: [
    CanteenService,
    TransportService,
    LibraryService,
    LabService,
    MedicalService,
    ShopService,
    EducastService,
    ModulesComplementairesOrionService,
  ],
  exports: [
    CanteenService,
    TransportService,
    LibraryService,
    LabService,
    MedicalService,
    ShopService,
    EducastService,
    ModulesComplementairesOrionService,
  ],
})
export class ModulesComplementairesModule {}

