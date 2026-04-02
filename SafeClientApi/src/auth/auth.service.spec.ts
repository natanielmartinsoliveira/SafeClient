// Mock bcrypt before any imports to avoid native binary SIGSEGV in WSL/Jest
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
  compare: jest.fn().mockImplementation((plain: string) =>
    Promise.resolve(plain === 'senha1234'),
  ),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

const mockUsersService = () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  describe('register', () => {
    it('should create user and return id + email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const created = { id: 'uuid-1', email: 'a@b.com', role: 'user' } as User;
      usersService.create.mockResolvedValue(created);

      const result = await service.register({ email: 'a@b.com', password: 'senha1234' });
      expect(result).toEqual({ id: 'uuid-1', email: 'a@b.com' });
      expect(usersService.findByEmail).toHaveBeenCalledWith('a@b.com');
    });

    it('should throw ConflictException when email already exists', async () => {
      usersService.findByEmail.mockResolvedValue({ id: '1', email: 'a@b.com' } as User);

      await expect(service.register({ email: 'a@b.com', password: 'senha1234' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access_token and email on valid credentials', async () => {
      const user = { id: '1', email: 'a@b.com', passwordHash: '$2b$10$mockedhash', role: 'user' } as User;
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.login({ email: 'a@b.com', password: 'senha1234' });
      expect(result).toMatchObject({ access_token: 'mock-token', email: 'a@b.com', role: 'user' });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'x@b.com', password: 'abc' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const user = { id: '1', email: 'a@b.com', passwordHash: '$2b$10$mockedhash', role: 'user' } as User;
      usersService.findByEmail.mockResolvedValue(user);

      await expect(service.login({ email: 'a@b.com', password: 'wrongpass' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
