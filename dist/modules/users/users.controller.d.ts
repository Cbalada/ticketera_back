import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    profile(user: JwtPayload): Promise<import("./entities/user.entity").User>;
    purchases(user: JwtPayload): Promise<import("../purchases/entities/purchase.entity").Purchase[]>;
}
