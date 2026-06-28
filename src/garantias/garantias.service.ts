import { Injectable } from '@nestjs/common';
import { CreateGarantiaDto } from './dto/create-garantia.dto';
import { UpdateGarantiaDto } from './dto/update-garantia.dto';
import { QueryDto } from 'src/common/dto/query.dto';

@Injectable()
export class GarantiasService {
  create(createGarantiaDto: CreateGarantiaDto) {
    return 'This action adds a new garantia';
  }

  findAll(query: QueryDto) {
    return `This action returns all garantias`;
  }

  findOne(id: number) {
    return `This action returns a #${id} garantia`;
  }

  update(id: number, updateGarantiaDto: UpdateGarantiaDto) {
    return `This action updates a #${id} garantia`;
  }

  remove(id: number) {
    return `This action removes a #${id} garantia`;
  }
}
