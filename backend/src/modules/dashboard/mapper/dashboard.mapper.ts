import type { DashboardResponseDto } from '../dto';

/**
 * Maps aggregated dashboard parts into the public API DTO.
 * Entities never leave the service layer — only DTOs are returned.
 */
export class DashboardMapper {
  toResponse(payload: Omit<DashboardResponseDto, 'success'>): DashboardResponseDto {
    return {
      success: true,
      ...payload,
    };
  }
}
