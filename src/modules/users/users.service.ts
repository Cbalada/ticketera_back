import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseStatus } from '../../common/enums/purchase-status.enum';
import { Purchase } from '../purchases/entities/purchase.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Purchase) private readonly purchases: Repository<Purchase>
  ) {}

  findProfile(id: number) {
    return this.users.findOneOrFail({ where: { id } });
  }

  purchasesHistory(userId: number) {
    return this.purchases.find({
      where: { userId, status: PurchaseStatus.SUCCESS },
      relations: { reservation: { eventSector: { event: true } } },
      order: { createdAt: 'DESC' }
    });
  }
}
