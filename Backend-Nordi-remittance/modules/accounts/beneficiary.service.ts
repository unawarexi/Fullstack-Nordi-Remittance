import mongoose from "mongoose";
import Users from "../users/users.model.js";
import { ValidationError, NotFoundError } from "../../core/errors/AppError.js";
import { emitToUser } from "../../services/websocket.service.js";

const WS_EVENTS = {
  BENEFICIARY_ADDED: "beneficiary:added",
  BENEFICIARY_REMOVED: "beneficiary:removed",
} as const;

export class BeneficiaryService {
  /**
   * Get saved beneficiaries
   */
  static async getBeneficiaries(userId: string) {
    const user = await Users.findById(userId).select("beneficiaries").lean();
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return { beneficiaries: user.beneficiaries || [] };
  }

  /**
   * Add new beneficiary
   */
  static async addBeneficiary(userId: string, data: { accountNumber?: string; email?: string; name?: string; nickname?: string; bankName?: string; bankCode?: string; type?: string }) {
    const { accountNumber, email, name, nickname, bankName, bankCode, type } = data;

    if (!accountNumber && !email) {
      throw new ValidationError("Account number or email is required");
    }

    if (accountNumber) {
      const beneficiaryUser = await Users.findOne({ accountNumber }).select(
        "firstName lastName accountNumber"
      );

      if (!beneficiaryUser) {
        throw new NotFoundError("Beneficiary not found");
      }
    }

    const beneficiary = {
      id: new mongoose.Types.ObjectId(),
      accountNumber,
      email,
      name: name || "Unknown",
      nickname: nickname || name,
      bankName,
      bankCode,
      type: type || "internal",
      createdAt: new Date(),
    };

    await Users.updateOne(
      { _id: userId },
      { $push: { beneficiaries: beneficiary } }
    );

    emitToUser(userId, WS_EVENTS.BENEFICIARY_ADDED, {
      beneficiary,
      message: "Beneficiary added successfully",
      timestamp: new Date().toISOString(),
    });

    return { beneficiary };
  }

  /**
   * Remove beneficiary
   */
  static async removeBeneficiary(userId: string, beneficiaryId: string | string[]) {
    const idStr = Array.isArray(beneficiaryId) ? beneficiaryId[0] : beneficiaryId;
    
    await Users.updateOne(
      { _id: userId },
      { $pull: { beneficiaries: { id: new mongoose.Types.ObjectId(idStr) } } }
    );

    emitToUser(userId, WS_EVENTS.BENEFICIARY_REMOVED, {
      beneficiaryId: idStr,
      message: "Beneficiary removed successfully",
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }
}
