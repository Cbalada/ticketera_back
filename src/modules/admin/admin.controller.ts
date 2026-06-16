import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdatePricesDto } from '../events/dto/update-prices.dto';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Patch('events/:eventId/prices')
  updatePrices(@Param('eventId', ParseIntPipe) eventId: number, @Body() dto: UpdatePricesDto) {
    return this.admin.updatePrices(eventId, dto);
  }

  @Get('sales')
  sales() {
    return this.admin.salesReport();
  }
}
