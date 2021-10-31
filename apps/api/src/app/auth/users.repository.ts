import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const user = this.create(authCredentialsDto);

    try {
      await this.save(user);
    } catch (e) {
      if (e.code === '23505') { // duplicate username
        throw new ConflictException('Username already exists');
      }
      throw new InternalServerErrorException();
    }
  }
}
