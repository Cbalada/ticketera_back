import { Global, Module } from '@nestjs/common';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { AppLogger } from './logger/app.logger';

@Global()
@Module({
  providers: [AppLogger, RolesGuard],
  exports: [AppLogger, RolesGuard]
})
export class CommonModule {}
