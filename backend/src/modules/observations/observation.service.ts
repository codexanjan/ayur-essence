import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { CreateObservationInput } from './observation.schema.js';

export class ObservationService {
  public static async addObservation(
    assessmentId: string,
    input: CreateObservationInput,
    userId: string
  ) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw ApiError.notFound(
        `Assessment with ID "${assessmentId}" was not found.`,
        'ASSESSMENT_NOT_FOUND'
      );
    }

    const observation = await prisma.observation.create({
      data: {
        assessmentId,
        createdBy: userId,
        notes: input.notes,
        source: input.source || 'PRACTITIONER',
      },
      include: {
        creator: {
          select: { id: true, fullName: true, role: true },
        },
      },
    });

    return observation;
  }
}
