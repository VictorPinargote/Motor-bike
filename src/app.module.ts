import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { MotosModule } from './motos/motos.module';
import { VentasModule } from './ventas/ventas.module';

@Module({
  imports: [AuthModule, ClientesModule, MotosModule, VentasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
