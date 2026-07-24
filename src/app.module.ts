import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { MotosModule } from './motos/motos.module';
import { VentasModule } from './ventas/ventas.module';
import { ReservasModule } from './reservas/reservas.module';
import { MarcasModule } from './marcas/marcas.module';
import { TipoMotorModule } from './tipo-motor/tipo-motor.module';
import { EstadoMotoModule } from './estado-moto/estado-moto.module';
import { ComentariosModule } from './comentarios/comentarios.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { MantenimientosModule } from './mantenimientos/mantenimientos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { GarantiasModule } from './garantias/garantias.module';
import { DescuentosModule } from './descuentos/descuentos.module';
import { ColoresModule } from './colores/colores.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { CarritoModule } from './carrito/carrito.module';
import { PagosModule } from './pagos/pagos.module';
import { ImagenesModule } from './imagenes/imagenes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Configuración Asíncrona para Mongoose
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
      }),
    }),
    
    // Configuración Asíncrona para TypeORM
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        //ssl: { rejectUnauthorized: false },
      }),
    }),
    
    AuthModule,
    UsersModule,
    CategoriesModule,
    MotosModule,
    VentasModule,
    ReservasModule,
    MarcasModule,
    TipoMotorModule,
    EstadoMotoModule,
    ComentariosModule,
    MensajesModule,
    MantenimientosModule,
    NotificacionesModule,
    GarantiasModule,
    DescuentosModule,
    ColoresModule,
    ProveedoresModule,
    CarritoModule,
    PagosModule,
    ImagenesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
