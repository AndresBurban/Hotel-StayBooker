import { Injectable } from '@nestjs/common';
import { CreateHabitacioneDto } from './dto/create-habitacione.dto';
import { UpdateHabitacioneDto } from './dto/update-habitacione.dto';

@Injectable()
export class HabitacionesService {
  create(createHabitacioneDto: CreateHabitacioneDto) {
    return 'This action adds a new habitacione';
  }

  findAll() {
    return `This action returns all habitaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} habitacione`;
  }

  update(id: number, updateHabitacioneDto: UpdateHabitacioneDto) {
    return `This action updates a #${id} habitacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} habitacione`;
  }
}
