import { prisma } from '../../config/database.js';

export class QuestionService {
  public static async getActiveQuestions(methodVersion = 'baseline-v1') {
    const questions = await prisma.question.findMany({
      where: {
        isActive: true,
        methodReference: methodVersion,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        code: true,
        prompt: true,
        answerType: true,
        options: true,
        version: true,
        methodReference: true,
      },
    });

    return {
      methodVersion,
      total: questions.length,
      questions,
    };
  }
}
