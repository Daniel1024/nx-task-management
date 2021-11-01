import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Brackets, EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { User } from '../auth/user.entity';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  private logger = new Logger('TasksRepository', true);

  async getTasks(filter: GetTaskFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filter;
    const query = this.createQueryBuilder('task');

    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      /*query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );*/
      query.andWhere(
        new Brackets((qb) => {
          qb.where('title ILIKE :search OR description ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    let tasks: Task[];
    try {
      tasks = await query.getMany();
    } catch (e) {
      const m = `Failed to get tasks for user "${user.username}". Filters: ${JSON.stringify(filter)}`;
      this.logger.error(m, e.stack)
      throw new  InternalServerErrorException();
    }

    return tasks;
  }

  createTask({ title, description }: CreateTaskDto, user: User): Promise<Task> {
    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user
    });

    return this.save(task);
  }
}
