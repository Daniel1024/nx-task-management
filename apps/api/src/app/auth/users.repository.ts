import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser({ username, password}: AuthCredentialsDto): Promise<void> {
    const salt = await genSalt();
    const hashedPass = await hash(password, salt);

    const user = this.create({ username, password: hashedPass });

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
