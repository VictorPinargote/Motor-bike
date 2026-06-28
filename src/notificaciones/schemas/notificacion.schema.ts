import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Notificacion extends Document {
  @Prop({ required: true })
  usuarioId: string;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: false })
  leida: boolean;

  @Prop({ default: Date.now })
  fechaCreacion: Date;
}

export const NotificacionSchema = SchemaFactory.createForClass(Notificacion);
