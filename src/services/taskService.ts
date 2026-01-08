import { Prisma, TaskCategory, TaskStatus } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../errors';
import { prisma } from '../prisma';
import type {
  CreateEvidenceRequest,
  CreateTaskRequest,
  EvidenceResponse,
  ListTasksResponse,
  PatchTaskRequest,
  TaskDetailsResponse,
  TaskResponse,
  UUID,
} from '../models/dtos';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function iso(d: Date): string {
  return d.toISOString();
}

function toTaskResponse(task: {
  id: string;
  organizationId: string;
  controlId: string;
  name: string;
  description: string | null;
  category: any;
  status: any;
  createdAt: Date;
  updatedAt: Date;
}): TaskResponse {
  return {
    id: task.id,
    organizationId: task.organizationId,
    controlId: task.controlId,
    name: task.name,
    description: task.description,
    category: task.category,
    status: task.status,
    createdAt: iso(task.createdAt),
    updatedAt: iso(task.updatedAt),
  };
}

function toEvidenceResponse(e: {
  id: string;
  taskId: string;
  type: any;
  note: string | null;
  createdAt: Date;
}): EvidenceResponse {
  return {
    id: e.id,
    taskId: e.taskId,
    type: e.type,
    note: e.note,
    createdAt: iso(e.createdAt),
  };
}

async function assertControlBelongsToOrg(organizationId: UUID, controlId: UUID): Promise<void> {
  const control = await prisma.control.findFirst({
    where: {
      id: controlId,
      framework: { organizationId },
    },
    select: { id: true },
  });

  if (!control) {
    // Treat cross-tenant or missing control as 404
    throw new NotFoundError('Control not found');
  }
}

export async function createTask(organizationId: UUID, input: CreateTaskRequest): Promise<TaskResponse> {
  await assertControlBelongsToOrg(organizationId, input.controlId);

  const task = await prisma.task.create({
    data: {
      organizationId,
      controlId: input.controlId,
      name: input.name,
      description: input.description,
      category: input.category,
      status: input.status,
    },
  });

  return toTaskResponse(task);
}

export async function listTasks(
  organizationId: UUID,
  params: {
    limit?: number;
    offset?: number;
    status?: TaskStatus;
    category?: TaskCategory;
    controlId?: UUID;
    search?: string;
  },
): Promise<ListTasksResponse> {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const offset = Math.max(params.offset ?? 0, 0);

  const where: Prisma.TaskWhereInput = {
    organizationId,
  };

  if (params.status) where.status = params.status;
  if (params.category) where.category = params.category;
  if (params.controlId) {
    where.controlId = params.controlId;
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
  ]);

  return {
    total,
    limit,
    offset,
    items: items.map(toTaskResponse),
  };
}

export async function getTaskDetails(organizationId: UUID, taskId: UUID): Promise<TaskDetailsResponse> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
    include: { evidence: true },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  return {
    ...toTaskResponse(task),
    evidence: task.evidence.map(toEvidenceResponse),
  };
}

export async function patchTask(
  organizationId: UUID,
  taskId: UUID,
  patch: PatchTaskRequest,
): Promise<TaskResponse> {
  if (Object.keys(patch).length === 0) {
    throw new BadRequestError('No fields provided to update');
  }

  if (patch.controlId) {
    await assertControlBelongsToOrg(organizationId, patch.controlId);
  }

  // Ensure task belongs to org before update (avoid leaking existence across tenants)
  const existing = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
    select: { id: true },
  });

  if (!existing) {
    throw new NotFoundError('Task not found');
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      controlId: patch.controlId,
      name: patch.name,
      description: patch.description === undefined ? undefined : patch.description,
      category: patch.category,
      status: patch.status,
    },
  });

  return toTaskResponse(updated);
}

export async function deleteTask(organizationId: UUID, taskId: UUID): Promise<void> {
  const res = await prisma.task.deleteMany({
    where: { id: taskId, organizationId },
  });

  if (res.count === 0) {
    throw new NotFoundError('Task not found');
  }
}

export async function addEvidence(
  organizationId: UUID,
  taskId: UUID,
  input: CreateEvidenceRequest,
): Promise<EvidenceResponse> {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
    select: { id: true },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const e = await prisma.evidence.create({
    data: {
      taskId,
      type: input.type,
      note: input.note,
    },
  });

  return toEvidenceResponse(e);
}

export async function deleteEvidence(
  organizationId: UUID,
  taskId: UUID,
  evidenceId: UUID,
): Promise<void> {
  const evidence = await prisma.evidence.findFirst({
    where: {
      id: evidenceId,
      taskId,
      task: { organizationId },
    },
    select: { id: true },
  });

  if (!evidence) {
    throw new NotFoundError('Evidence not found');
  }

  await prisma.evidence.delete({
    where: { id: evidenceId },
  });
}
