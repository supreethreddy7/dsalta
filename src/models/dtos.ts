import { EvidenceType, TaskCategory, TaskStatus } from '@prisma/client';

export type UUID = string;

export interface CreateTaskRequest {
  controlId: UUID;
  name: string;
  description?: string;
  category: TaskCategory;
  status?: TaskStatus;
}

export interface PatchTaskRequest {
  controlId?: UUID;
  name?: string;
  description?: string | null;
  category?: TaskCategory;
  status?: TaskStatus;
}

export interface TaskResponse {
  id: UUID;
  organizationId: UUID;
  controlId: UUID;
  name: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetailsResponse extends TaskResponse {
  evidence: EvidenceResponse[];
}

export interface ListTasksResponse {
  total: number;
  limit: number;
  offset: number;
  items: TaskResponse[];
}

export interface CreateEvidenceRequest {
  type: EvidenceType;
  note?: string;
}

export interface EvidenceResponse {
  id: UUID;
  taskId: UUID;
  type: EvidenceType;
  note: string | null;
  createdAt: string;
}
