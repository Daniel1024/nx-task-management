import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';

@EntityRepository(Task)
export class TasksRepository extends Repository<Task> {
  getTasks({ status, search }: GetTaskFilterDto): Promise<Task[]> {
    const query = this.createQueryBuilder('task');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search)',
        { search: `%${search}%` }
      );
    }

    return query.getMany();
  }

  createTask({ title, description }: CreateTaskDto): Promise<Task> {
    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN
    });

    return this.save(task);
  }
}
