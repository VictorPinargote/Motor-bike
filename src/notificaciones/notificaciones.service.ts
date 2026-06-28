import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notificacion } from './schemas/notificacion.schema';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectModel(Notificacion.name)
    private readonly notificacionModel: Model<Notificacion>,
  ) {}

  async create(dto: CreateNotificacionDto): Promise<Notificacion | null> {
    try {
      const notificacion = new this.notificacionModel(dto);
      return await notificacion.save();
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async findAll(options: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<any | null> {
    try {
      const { page, limit, search } = options;

      const filter = search
        ? {
            $or: [
              { usuarioId: { $regex: search, $options: 'i' } },
              { titulo: { $regex: search, $options: 'i' } },
              { mensaje: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const notificaciones = await this.notificacionModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ fechaCreacion: -1 });

      return { items: notificaciones, page, limit };
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      return null;
    }
  }

  async findOne(id: string): Promise<Notificacion | null> {
    try {
      return await this.notificacionModel.findById(id);
    } catch (error) {
      console.error('Error finding notification:', error);
      return null;
    }
  }

  async update(
    id: string,
    dto: UpdateNotificacionDto,
  ): Promise<Notificacion | null> {
    try {
      return await this.notificacionModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      return null;
    }
  }

  async remove(id: string): Promise<Notificacion | null> {
    try {
      return await this.notificacionModel.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      return null;
    }
  }
}
