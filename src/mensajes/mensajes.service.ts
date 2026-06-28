import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mensaje } from './schemas/mensaje.schema';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';

@Injectable()
export class MensajesService {
  constructor(
    @InjectModel(Mensaje.name)
    private readonly mensajeModel: Model<Mensaje>,
  ) {}

  async create(dto: CreateMensajeDto): Promise<Mensaje | null> {
    try {
      const mensaje = new this.mensajeModel(dto);
      return await mensaje.save();
    } catch (error) {
      console.error('Error creating message:', error);
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
              { nombre: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { mensaje: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const mensajes = await this.mensajeModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ fecha: -1 });

      return { items: mensajes, page, limit };
    } catch (error) {
      console.error('Error retrieving messages:', error);
      return null;
    }
  }

  async findOne(id: string): Promise<Mensaje | null> {
    try {
      return await this.mensajeModel.findById(id);
    } catch (error) {
      console.error('Error finding message:', error);
      return null;
    }
  }

  async update(id: string, dto: UpdateMensajeDto): Promise<Mensaje | null> {
    try {
      return await this.mensajeModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
    } catch (error) {
      console.error('Error updating message:', error);
      return null;
    }
  }

  async remove(id: string): Promise<Mensaje | null> {
    try {
      return await this.mensajeModel.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting message:', error);
      return null;
    }
  }
}
