import { AccountApplications } from "./accounts.model.js";
import { AppError, ValidationError, NotFoundError } from "../../core/errors/AppError.js";
import mongoose from "mongoose";

export class AccountApplicationsService {
  /**
   * Submit a new account application
   */
  static async applyForAccount(userId: string, payload: any) {
    const { type } = payload;
    
    if (!["savings", "current", "fixed_deposit"].includes(type)) {
      throw new ValidationError("Invalid account application type");
    }

    const applicationData = {
      ...payload,
      user: userId,
      status: "pending",
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    const application = await AccountApplications.create(applicationData);
    return application;
  }

  /**
   * Get all applications for a user
   */
  static async getUserApplications(userId: string) {
    const applications = await AccountApplications.find({ user: userId }).sort({ submittedAt: -1 });
    return applications;
  }

  /**
   * Cancel a pending application
   */
  static async cancelApplication(applicationId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      throw new ValidationError("Invalid application ID");
    }

    const application = await AccountApplications.findOne({ _id: applicationId, user: userId });
    
    if (!application) {
      throw new NotFoundError("Application not found");
    }

    if (application.status !== "pending") {
      throw new ValidationError(`Cannot cancel a ${application.status} application`);
    }

    await AccountApplications.deleteOne({ _id: applicationId });
    return { message: "Application cancelled successfully" };
  }
}

export default AccountApplicationsService;
