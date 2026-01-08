import {
  Body,
  Controller,
  Delete,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import type { CreateEvidenceRequest, EvidenceResponse } from '../models/dtos';
import { addEvidence, deleteEvidence } from '../services/taskService';

@Route('v1/organizations/{organizationId}/tasks/{taskId}/evidence')
@Tags('Evidence')
export class EvidenceController extends Controller {
  /**
   * Add an evidence item to a task.
   */
  @SuccessResponse('201', 'Created')
  @Post()
  public async create(
    @Path() organizationId: string,
    @Path() taskId: string,
    @Body() body: CreateEvidenceRequest,
  ): Promise<EvidenceResponse> {
    this.setStatus(201);
    return addEvidence(organizationId, taskId, body);
  }

  /**
   * Delete an evidence item.
   */
  @SuccessResponse('204', 'No Content')
  @Delete('{evidenceId}')
  public async delete(
    @Path() organizationId: string,
    @Path() taskId: string,
    @Path() evidenceId: string,
  ): Promise<void> {
    await deleteEvidence(organizationId, taskId, evidenceId);
    this.setStatus(204);
    return;
  }
}
