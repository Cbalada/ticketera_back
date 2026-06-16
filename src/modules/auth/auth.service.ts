import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '../../common/exceptions/unauthorized.exception';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.users.exist({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }
    const password = await this.hash(dto.password);
    const userCount = await this.users.count();
    const role = userCount === 0 ? UserRole.ADMIN : UserRole.USER;
    const user = await this.users.save(this.users.create({ ...dto, password, role }));
    return this.issueTokensAndPersist(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    let passwordMatches = false;
    try {
      passwordMatches = await bcrypt.compare(dto.password, user.password);
    } catch {
      passwordMatches = false;
    }
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokensAndPersist(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'change-me-refresh')
      });
      const user = await this.users.findOne({ where: { id: payload.sub } });
      if (!user?.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      let refreshMatches = false;
      try {
        refreshMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      } catch {
        refreshMatches = false;
      }
      if (!refreshMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return this.issueTokensAndPersist(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await this.users.update(userId, { refreshTokenHash: null });
    return { success: true };
  }

  private async issueTokensAndPersist(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET', 'change-me-access'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'change-me-refresh'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
      })
    ]);
    await this.users.update(user.id, { refreshTokenHash: await this.hash(refreshToken) });
    return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  private hash(value: string) {
    const roundsRaw = this.config.get<string>('BCRYPT_SALT_ROUNDS', '10');
    const rounds = Number(roundsRaw);
    const saltOrRounds = Number.isFinite(rounds) && rounds > 0 ? rounds : 10;
    return bcrypt.hash(value, saltOrRounds);
  }
}
