import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository
  ) {}

  signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.usersRepository.createUser(authCredentialsDto);
  }

  async signIn({ username, password }: AuthCredentialsDto): Promise<string> {
    const user = await this.usersRepository.findOne({ username });

    if (user && (await compare(password, user.password))) {
      return 'success';
    }

    throw new UnauthorizedException('Please check your login credentials');
  }
}
