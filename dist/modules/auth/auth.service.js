"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const typeorm_2 = require("typeorm");
const unauthorized_exception_1 = require("../../common/exceptions/unauthorized.exception");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let AuthService = class AuthService {
    constructor(users, jwt, config) {
        this.users = users;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const exists = await this.users.exist({ where: { email: dto.email } });
        if (exists) {
            throw new common_1.ConflictException('Email already registered');
        }
        const password = await this.hash(dto.password);
        const userCount = await this.users.count();
        const role = userCount === 0 ? user_role_enum_1.UserRole.ADMIN : user_role_enum_1.UserRole.USER;
        const user = await this.users.save(this.users.create({ ...dto, password, role }));
        return this.issueTokensAndPersist(user);
    }
    async login(dto) {
        const user = await this.users.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new unauthorized_exception_1.UnauthorizedException('Invalid credentials');
        }
        let passwordMatches = false;
        try {
            passwordMatches = await bcrypt.compare(dto.password, user.password);
        }
        catch {
            passwordMatches = false;
        }
        if (!passwordMatches) {
            throw new unauthorized_exception_1.UnauthorizedException('Invalid credentials');
        }
        return this.issueTokensAndPersist(user);
    }
    async refresh(refreshToken) {
        try {
            const payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET', 'change-me-refresh')
            });
            const user = await this.users.findOne({ where: { id: payload.sub } });
            if (!user?.refreshTokenHash) {
                throw new unauthorized_exception_1.UnauthorizedException('Invalid refresh token');
            }
            let refreshMatches = false;
            try {
                refreshMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
            }
            catch {
                refreshMatches = false;
            }
            if (!refreshMatches) {
                throw new unauthorized_exception_1.UnauthorizedException('Invalid refresh token');
            }
            return this.issueTokensAndPersist(user);
        }
        catch {
            throw new unauthorized_exception_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.users.update(userId, { refreshTokenHash: null });
        return { success: true };
    }
    async issueTokensAndPersist(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET', 'change-me-access'),
                expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m')
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET', 'change-me-refresh'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d')
            })
        ]);
        await this.users.update(user.id, { refreshTokenHash: await this.hash(refreshToken) });
        return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }
    hash(value) {
        const roundsRaw = this.config.get('BCRYPT_SALT_ROUNDS', '10');
        const rounds = Number(roundsRaw);
        const saltOrRounds = Number.isFinite(rounds) && rounds > 0 ? rounds : 10;
        return bcrypt.hash(value, saltOrRounds);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map