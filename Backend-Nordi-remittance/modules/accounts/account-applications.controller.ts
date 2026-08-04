import { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { AccountApplicationsService } from './account-applications.service.js';
import { AppError, UnauthorizedError } from '../../core/errors/AppError.js';

export class AccountApplicationsController {
  /**
   * Apply for a new account (Savings, Current, Fixed Deposit)
   */
  static async applyForAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('Unauthorized access');
      }

      const application = await AccountApplicationsService.applyForAccount(userId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Get all applications for the current user
   */
  static async getUserApplications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('Unauthorized access');
      }

      const applications = await AccountApplicationsService.getUserApplications(userId);

      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /**
   * Cancel a pending application
   */
  static async cancelApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new UnauthorizedError('Unauthorized access');
      }

      const result = await AccountApplicationsService.cancelApplication(id as string, userId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default AccountApplicationsController;
