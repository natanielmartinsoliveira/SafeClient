import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

const mockRepo = () => ({
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useFactory: mockRepo }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const user = { id: '1', email: 'a@b.com', passwordHash: 'hash', role: 'user' } as User;
      repo.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('a@b.com');
      expect(result).toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
    });

    it('should return null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@b.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const user = { id: 'uuid-1', email: 'a@b.com', role: 'user' } as User;
      repo.findOne.mockResolvedValue(user);

      const result = await service.findById('uuid-1');
      expect(result).toEqual(user);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });
  });

  describe('create', () => {
    it('should create and save a user with default role', async () => {
      const user = { id: '1', email: 'a@b.com', passwordHash: 'hash', role: 'user' } as User;
      repo.create.mockReturnValue(user);
      repo.save.mockResolvedValue(user);

      const result = await service.create('a@b.com', 'hash');
      expect(repo.create).toHaveBeenCalledWith({
        email: 'a@b.com',
        passwordHash: 'hash',
        role: 'user',
      });
      expect(result).toEqual(user);
    });

    it('should create admin user when role is admin', async () => {
      const user = { id: '2', email: 'admin@b.com', passwordHash: 'hash', role: 'admin' } as User;
      repo.create.mockReturnValue(user);
      repo.save.mockResolvedValue(user);

      const result = await service.create('admin@b.com', 'hash', 'admin');
      expect(repo.create).toHaveBeenCalledWith({
        email: 'admin@b.com',
        passwordHash: 'hash',
        role: 'admin',
      });
      expect(result.role).toBe('admin');
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: '1', email: 'a@b.com' }] as User[];
      repo.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll(1, 10);
      expect(result).toEqual([users, 1]);
      expect(repo.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });
});
