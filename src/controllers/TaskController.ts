import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { TaskCategory, TaskStatus } from '@prisma/client';
import type {
  CreateTaskRequest,
  ListTasksResponse,
  PatchTaskRequest,
  TaskDetailsResponse,
  TaskResponse,
} from '../models/dtos';
import {
  createTask,
  deleteTask,
  getTaskDetails,
  listTasks,
  patchTask,
} from '../services/taskService';

@Route('v1/organizations/{organizationId}/tasks')
@Tags('Tasks')
export class TaskController extends Controller {
  /**
   * Create a compliance task for an organization.
   */
  @SuccessResponse('201', 'Created')
  @Post()
  public async create(
    @Path() organizationId: string,
    @Body() body: CreateTaskRequest,
  ): Promise<TaskResponse> {
    this.setStatus(201);
    console.log('Creating task with body:', body);
    return createTask(organizationId, body);
  }

  /**
   * List tasks (supports pagination + filtering).
   */
  @Get()
  public async list(
    @Path() organizationId: string,
    @Query() limit?: number,
    @Query() offset?: number,
    @Query() status?: TaskStatus,
    @Query() category?: TaskCategory,
    @Query() controlId?: string,
    @Query() search?: string,
  ): Promise<ListTasksResponse> {
    return listTasks(organizationId, {
      limit,
      offset,
      status,
      category,
      controlId,
      search,
    });
  }

  /**
   * Get task details (includes evidence items).
   */
  @Get('{taskId}')
  public async get(
    @Path() organizationId: string,
    @Path() taskId: string,
  ): Promise<TaskDetailsResponse> {
    return getTaskDetails(organizationId, taskId);
  }

  /**
   * Patch (partial update) a task.
   */
  @Patch('{taskId}')
  public async patch(
    @Path() organizationId: string,
    @Path() taskId: string,
    @Body() body: PatchTaskRequest,
  ): Promise<TaskResponse> {
    return patchTask(organizationId, taskId, body);
  }

  /**
   * Delete a task.
   */
  @SuccessResponse('204', 'No Content')
  @Delete('{taskId}')
  public async delete(@Path() organizationId: string, @Path() taskId: string): Promise<void> {
    await deleteTask(organizationId, taskId);
    this.setStatus(204);
    return;
  }
}
