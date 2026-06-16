import { Repository } from 'typeorm';
import { Purchase } from '../purchases/entities/purchase.entity';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly users;
    private readonly purchases;
    constructor(users: Repository<User>, purchases: Repository<Purchase>);
    findProfile(id: number): Promise<User>;
    purchasesHistory(userId: number): Promise<Purchase[]>;
}
