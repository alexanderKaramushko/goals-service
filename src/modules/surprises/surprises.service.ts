import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db';
import { CreateSurpriseDto } from './dto';

@Injectable()
export class SurprisesService {
  constructor(private dbService: DbService) {}

  async create(createSurpriseDto: CreateSurpriseDto) {
    return await this.dbService.query(
      `INSERT INTO surprises (user_id, target_id, title, description, type)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
          RETURNING *;
        `,
      [
        createSurpriseDto.userId,
        createSurpriseDto.targetId,
        createSurpriseDto.title,
        createSurpriseDto.description,
        createSurpriseDto.userId ? 'user' : 'target',
      ],
    );
  }
}
