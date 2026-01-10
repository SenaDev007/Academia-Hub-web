import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CanteenService } from './services/canteen.service';
import { TransportService } from './services/transport.service';
import { LibraryService } from './services/library.service';
import { LabService } from './services/lab.service';
import { MedicalService } from './services/medical.service';
import { ShopService } from './services/shop.service';
import { EducastService } from './services/educast.service';
import { ModulesComplementairesOrionService } from './services/modules-complementaires-orion.service';

/**
 * Controller pour le MODULE 9 — Modules Complémentaires
 */
@Controller('modules-complementaires')
@UseGuards(JwtAuthGuard)
export class ModulesComplementairesController {
  constructor(
    private readonly canteenService: CanteenService,
    private readonly transportService: TransportService,
    private readonly libraryService: LibraryService,
    private readonly labService: LabService,
    private readonly medicalService: MedicalService,
    private readonly shopService: ShopService,
    private readonly educastService: EducastService,
    private readonly orionService: ModulesComplementairesOrionService,
  ) {}

  // ============================================================================
  // 9.1 CANTINE
  // ============================================================================

  @Get('canteen/menus')
  async getCanteenMenus(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.canteenService.findAllMenus(tenantId, academicYearId);
  }

  @Post('canteen/menus')
  async createCanteenMenu(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.canteenService.createMenu(tenantId, academicYearId, data);
  }

  @Get('canteen/menus/:id')
  async getCanteenMenu(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.canteenService.findMenu(id, tenantId);
  }

  @Put('canteen/menus/:id')
  async updateCanteenMenu(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.canteenService.updateMenu(id, tenantId, data);
  }

  @Get('canteen/menus/:id/meals')
  async getCanteenMeals(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.canteenService.findAllMeals(id, tenantId);
  }

  @Post('canteen/menus/:id/meals')
  async addMeal(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.canteenService.addMeal(id, tenantId, data);
  }

  @Put('canteen/enrollments/:id')
  async updateCanteenEnrollment(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.canteenService.updateEnrollment(id, tenantId, data);
  }

  @Get('canteen/enrollments')
  async getCanteenEnrollments(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.canteenService.findAllEnrollments(tenantId, academicYearId, { studentId });
  }

  @Post('canteen/enrollments')
  async enrollStudent(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.canteenService.enrollStudent(tenantId, academicYearId, data);
  }

  @Post('canteen/attendances')
  async recordCanteenAttendance(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.canteenService.recordAttendance(data.enrollmentId, tenantId, data, user.id);
  }

  @Get('canteen/stats')
  async getCanteenStats(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.canteenService.getAttendanceStats(tenantId, academicYearId);
  }

  // ============================================================================
  // 9.2 TRANSPORT
  // ============================================================================

  @Get('transport/vehicles')
  async getVehicles(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.transportService.findAllVehicles(tenantId, academicYearId);
  }

  @Get('transport/vehicles/:id')
  async getVehicle(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.transportService.findVehicle(id, tenantId);
  }

  @Put('transport/vehicles/:id')
  async updateVehicle(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.transportService.updateVehicle(id, tenantId, data);
  }

  @Get('transport/routes')
  async getRoutes(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.transportService.findAllRoutes(tenantId, academicYearId);
  }

  @Post('transport/routes/:id/stops')
  async addRouteStop(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.transportService.addRouteStop(id, tenantId, data);
  }

  @Get('transport/assignments')
  async getTransportAssignments(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.transportService.findAllAssignments(tenantId, academicYearId, { studentId });
  }

  @Put('transport/assignments/:id')
  async updateTransportAssignment(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.transportService.updateAssignment(id, tenantId, data);
  }

  @Get('transport/incidents')
  async getTransportIncidents(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('severity') severity?: string,
    @Query('resolved') resolved?: string,
  ) {
    return this.transportService.getIncidents(tenantId, academicYearId, { severity, resolved: resolved === 'true' });
  }

  @Post('transport/vehicles')
  async createVehicle(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.transportService.createVehicle(tenantId, academicYearId, data);
  }

  @Post('transport/routes')
  async createRoute(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.transportService.createRoute(tenantId, academicYearId, data);
  }

  @Post('transport/assignments')
  async assignStudent(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.transportService.assignStudent(tenantId, academicYearId, data);
  }

  @Post('transport/attendances')
  async recordTransportAttendance(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.transportService.recordAttendance(data.assignmentId, tenantId, data, user.id);
  }

  @Post('transport/incidents')
  async reportTransportIncident(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.transportService.reportIncident(tenantId, academicYearId, data, user.id);
  }

  @Get('transport/stats')
  async getTransportStats(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.transportService.getTransportStats(tenantId, academicYearId);
  }

  // ============================================================================
  // 9.3 BIBLIOTHÈQUE
  // ============================================================================

  @Get('library/books')
  async getBooks(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('category') category?: string,
  ) {
    return this.libraryService.findAllBooks(tenantId, academicYearId, { category });
  }

  @Post('library/books')
  async createBook(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.libraryService.createBook(tenantId, academicYearId, data);
  }

  @Get('library/loans')
  async getLibraryLoans(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    return this.libraryService.findAllLoans(tenantId, academicYearId, { studentId, status });
  }

  @Post('library/loans')
  async loanBook(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.libraryService.loanBook(tenantId, academicYearId, data, user.id);
  }

  @Post('library/loans/:id/return')
  async returnBook(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.libraryService.returnBook(id, tenantId, user.id);
  }

  @Get('library/overdue')
  async getOverdueLoans(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.libraryService.getOverdueLoans(tenantId, academicYearId);
  }

  @Get('library/stats')
  async getLibraryStats(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.libraryService.getLibraryStats(tenantId, academicYearId);
  }

  // ============================================================================
  // 9.4 LABORATOIRES
  // ============================================================================

  @Get('labs')
  async getLabs(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.labService.findAllLabs(tenantId, academicYearId);
  }

  @Post('labs')
  async createLab(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.labService.createLab(tenantId, academicYearId, data);
  }

  @Get('labs/:id/equipment')
  async getLabEquipment(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.labService.findAllEquipment(id, tenantId);
  }

  @Put('labs/equipment/:id')
  async updateLabEquipment(
    @Param('id') id: string,
    @Query('labId') labId: string,
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.labService.updateEquipment(id, labId, tenantId, data);
  }

  @Post('labs/:id/equipment')
  async addEquipment(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.labService.addEquipment(id, tenantId, data);
  }

  @Post('labs/:id/reservations')
  async reserveLab(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.labService.reserveLab(id, tenantId, data, user.id);
  }

  @Post('labs/incidents')
  async reportLabIncident(
    @Param('equipmentId') equipmentId: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.labService.reportIncident(equipmentId, tenantId, data, user.id);
  }

  @Get('labs/stats')
  async getLabStats(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.labService.getLabStats(tenantId, academicYearId);
  }

  // ============================================================================
  // 9.5 INFIRMERIE
  // ============================================================================

  @Get('medical/records')
  async getMedicalRecords(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.medicalService.findAllRecords(tenantId, academicYearId, { studentId });
  }

  @Post('medical/records')
  async createOrUpdateMedicalRecord(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.medicalService.createOrUpdateRecord(tenantId, academicYearId, data.studentId, data);
  }

  @Get('medical/records/:id/visits')
  async getMedicalVisits(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.medicalService.findAllVisits(id, tenantId);
  }

  @Post('medical/visits')
  async recordMedicalVisit(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.medicalService.recordVisit(data.recordId, tenantId, data, user.id);
  }

  @Post('medical/alerts')
  async createMedicalAlert(
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.medicalService.createAlert(data.recordId, tenantId, data);
  }

  @Get('medical/alerts/critical')
  async getCriticalAlerts(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.medicalService.getCriticalAlerts(tenantId, academicYearId);
  }

  @Get('medical/stats')
  async getMedicalStats(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.medicalService.getMedicalStats(tenantId, academicYearId);
  }

  // ============================================================================
  // 9.6 BOUTIQUE
  // ============================================================================

  @Get('shop/products')
  async getProducts(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.shopService.findAllProducts(tenantId, academicYearId);
  }

  @Post('shop/products')
  async createProduct(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Body() data: any,
  ) {
    return this.shopService.createProduct(tenantId, academicYearId, data);
  }

  @Post('shop/sales')
  async createSale(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.shopService.createSale(tenantId, academicYearId, data, user.id);
  }

  @Get('shop/stats')
  async getShopStats(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.shopService.getShopStats(tenantId, academicYearId);
  }

  // ============================================================================
  // 9.7 EDUCAST
  // ============================================================================

  @Get('educast/contents')
  async getContents(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @Query('contentType') contentType?: string,
  ) {
    return this.educastService.findAllContents(tenantId, academicYearId, { contentType });
  }

  @Post('educast/contents')
  async createContent(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.educastService.createContent(tenantId, academicYearId, data, user.id);
  }

  @Post('educast/contents/:id/access')
  async grantAccess(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() data: any,
  ) {
    return this.educastService.grantAccess(id, tenantId, data, user.id);
  }

  @Post('educast/sessions')
  async startSession(
    @TenantId() tenantId: string,
    @Body() data: any,
  ) {
    return this.educastService.startSession(data.contentId, data.studentId, tenantId, data.deviceType);
  }

  @Post('educast/sessions/:id/end')
  async endSession(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: { progress?: number },
  ) {
    return this.educastService.endSession(id, tenantId, data.progress);
  }

  @Get('educast/stats')
  async getEducastStats(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.educastService.getContentStats(tenantId, academicYearId);
  }

  // ============================================================================
  // ORION INTEGRATION
  // ============================================================================

  @Get('orion/kpis')
  async getOrionKPIs(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.orionService.getAllKPIs(tenantId, academicYearId);
  }

  @Get('orion/alerts')
  async getOrionAlerts(
    @TenantId() tenantId: string,
    @Query('academicYearId') academicYearId: string,
  ) {
    return this.orionService.generateAlerts(tenantId, academicYearId);
  }
}

