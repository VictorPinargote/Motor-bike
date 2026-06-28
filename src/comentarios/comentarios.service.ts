import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario } from './schemas/comentario.schema';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<Comentario>,
  ) {}

  async create(dto: CreateComentarioDto): Promise<Comentario | null> {
    try {
      const comentario = new this.comentarioModel(dto);
      return await comentario.save();
    } catch (error) {
      console.error('Error creating comment:', error);
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
              { userId: { $regex: search, $options: 'i' } },
              { motoId: { $regex: search, $options: 'i' } },
              { contenido: { $regex: search, $options: 'i' } },
            ],
          }
        : {};

      const comentarios = await this.comentarioModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ fecha: -1 });

      return { items: comentarios, page, limit };
    } catch (error) {
      console.error('Error retrieving comments:', error);
      return null;
    }
  }

  async findOne(id: string): Promise<Comentario | null> {
    try {
      return await this.comentarioModel.findById(id);
    } catch (error) {
      console.error('Error finding comment:', error);
      return null;
    }
  }

  async update(
    id: string,
    dto: UpdateComentarioDto,
  ): Promise<Comentario | null> {
    try {
      return await this.comentarioModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      return null;
    }
  }

  async remove(id: string): Promise<Comentario | null> {
    try {
      return await this.comentarioModel.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      return null;
    }
  }
}
