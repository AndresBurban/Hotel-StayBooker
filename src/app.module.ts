import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ConfigModule, } from './config/config.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { HabitacionesModule } from './habitaciones/habitaciones.module';
import { ReservasModule } from './reservas/reservas.module';
import { CommonModule } from './common/common.module';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>(
          'DB_DATABASE',
          'hotel_staybooker',
        ),
        autoLoadEntities: true,

        // Solo para desarrollo local.
        synchronize:
          config.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
    UsuariosModule,
    RolesModule,
  ],

})

export class AppModule {}
