import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicTrack, AcademicTrackCode } from './entities/academic-track.entity';
import { CreateAcademicTrackDto } from './dto/create-academic-track.dto';
import { UpdateAcademicTrackDto } from './dto/update-academic-track.dto';

@Injectable()
export class AcademicTracksRepository {
  constructor(
    @InjectRepository(AcademicTrack)
    private readonly repository: Repository<AcademicTrack>,
  ) {}

  async create(data: CreateAcademicTrackDto & { tenantId: string }): Promise<AcademicTrack> {
    const track = this.repository.create(data);
    return this.repository.save(track);
  }

  async findAll(tenantId: string): Promise<AcademicTrack[]> {
    return this.repository.find({
      where: { tenantId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<AcademicTrack | null> {
    return this.repository.findOne({
      where: { id, tenantId },
    });
  }

  async findByCode(code: AcademicTrackCode, tenantId: string): Promise<AcademicTrack | null> {
    return this.repository.findOne({
      where: { code, tenantId },
    });
  }

  async findDefault(tenantId: string): Promise<AcademicTrack | null> {
    return this.repository.findOne({
      where: { tenantId, isDefault: true },
    });
  }

  async update(id: string, tenantId: string, data: UpdateAcademicTrackDto): Promise<AcademicTrack> {
    await this.repository.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repository.delete({ id, tenantId });
  }

  /**
   * Initialise le track FR par défaut pour un tenant
   * Appelé lors de la création d'un tenant ou de l'activation du module bilingue
   */
  async initializeDefaultTrack(tenantId: string): Promise<AcademicTrack> {
    const existing = await this.findByCode(AcademicTrackCode.FR, tenantId);
    if (existing) {
      return existing;
    }

    return this.create({
      code: AcademicTrackCode.FR,
      name: 'Francophone',
      description: 'Piste académique francophone (par défaut)',
      order: 0,
      isActive: true,
      isDefault: true,
      tenantId,
    });
  }
}

