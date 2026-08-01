import bcrypt from "bcryptjs";
import { AdminUsers, AdminActionLogs } from "./admin.model.js";
import { generateAuthTokens } from "../../core/helpers/token.helper.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from "../../core/errors/AppError.js";

const emailGenerator = new EmailContentGenerator();

function generateOtp(): { code: string; expiresAt: Date } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { code, expiresAt };
}

function verifyOtp(admin: any, providedCode: string, purpose: string): boolean {
  if (!admin.pendingOtp || !admin.pendingOtp.code) return false;
  if (admin.pendingOtp.purpose !== purpose) return false;
  if (admin.pendingOtp.expiresAt < new Date()) return false;
  if (admin.pendingOtp.attempts >= 3) return false;
  return admin.pendingOtp.code === providedCode;
}

export class AdminAuthService {
  static async adminLogin(data: any, ip: string, userAgent: string) {
    const { email, password, twoFactorCode } = data;

    const admin: any = await AdminUsers.findOne({
      email: email.toLowerCase(),
    }).populate("permissions");

    if (!admin) throw new UnauthorizedError("Invalid credentials");
    if (!admin.isActive) throw new ForbiddenError("Account is not active");
    if (admin.isLocked) throw new ForbiddenError("Account is locked");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      admin.loginAttempts = (admin.loginAttempts || 0) + 1;

      if (admin.loginAttempts >= 5) {
        admin.isLocked = true;
      }

      await admin.save();
      throw new UnauthorizedError("Invalid credentials");
    }

    admin.loginAttempts = 0;
    admin.lastLogin = new Date();
    await admin.save();

    const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const { accessToken: token } = await generateAuthTokens(
      admin._id.toString(),
      admin.email,
      admin.role,
      sessionId,
    );

    await AdminActionLogs.create({
      admin: admin._id,
      action: "LOGIN",
      resource: "admin",
      resourceId: admin._id.toString(),
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    return {
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        permissions: admin.permissions,
      },
      token,
    };
  }

  static async adminLogout(adminId: string, ip: string, userAgent: string) {
    await AdminActionLogs.create({
      admin: adminId,
      action: "LOGOUT",
      resource: "admin",
      resourceId: adminId,
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });
    return null;
  }

  static async getAdminProfile(adminId: string) {
    const admin = await AdminUsers.findById(adminId)
      .select("-password -twoFactorSecret -pendingOtp -passwordHistory")
      .populate("permissions")
      .lean();

    if (!admin) throw new NotFoundError("Admin not found");

    return { admin };
  }

  static async requestOtp(adminId: string, purpose: string, ip: string, userAgent: string) {
    if (!purpose) throw new ValidationError("Purpose is required");

    const admin = await AdminUsers.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");

    const { code, expiresAt } = generateOtp();

    admin.pendingOtp = {
      code,
      purpose,
      expiresAt,
      attempts: 0,
    };

    await admin.save();

    const emailContent = emailGenerator.otpEmail({
      firstName: admin.firstName,
      email: admin.email,
      otpCode: code,
      purpose:
        purpose === "password_change"
          ? "Password Change"
          : purpose === "email_change"
            ? "Email Change"
            : "Sensitive Operation",
      expiresIn: "10 minutes",
    });

    await queueTemplatedMail(admin.email, emailContent);

    await AdminActionLogs.create({
      admin: adminId,
      action: "REQUEST_OTP",
      resource: "admin",
      resourceId: adminId,
      changes: { purpose },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    return { message: "OTP sent to your email" };
  }

  static async updateAdminProfile(adminId: string, data: any, ip: string, userAgent: string) {
    const { firstName, lastName, phone, avatar } = data;

    const admin = await AdminUsers.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");

    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phone) admin.phone = phone;
    if (avatar) admin.avatar = avatar;

    admin.updatedAt = new Date();
    await admin.save();

    await AdminActionLogs.create({
      admin: adminId,
      action: "UPDATE_PROFILE",
      resource: "admin",
      resourceId: adminId,
      changes: { firstName, lastName, phone },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    return {
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        phone: admin.phone,
        avatar: admin.avatar,
        role: admin.role,
      },
    };
  }

  static async changeAdminPassword(adminId: string, data: any, ip: string, userAgent: string) {
    const { currentPassword, newPassword, otp } = data;

    if (!currentPassword || !newPassword || !otp) {
      throw new ValidationError("Current password, new password, and OTP are required");
    }

    const admin = await AdminUsers.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");

    if (!verifyOtp(admin, otp, "password_change")) {
      admin.pendingOtp!.attempts = (admin.pendingOtp?.attempts || 0) + 1;
      await admin.save();
      throw new ValidationError("Invalid or expired OTP");
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    if (admin.passwordHistory && admin.passwordHistory.length > 0) {
      for (const oldHash of admin.passwordHistory.slice(-5)) {
        if (await bcrypt.compare(newPassword, oldHash)) {
          throw new ValidationError("Cannot reuse recent passwords");
        }
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    admin.passwordHistory = admin.passwordHistory || [];
    admin.passwordHistory.push(admin.password);
    admin.password = hashedPassword;
    admin.passwordChangedAt = new Date();
    admin.mustChangePassword = false;
    admin.pendingOtp = undefined;

    await admin.save();

    await AdminActionLogs.create({
      admin: adminId,
      action: "CHANGE_PASSWORD",
      resource: "admin",
      resourceId: adminId,
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    const emailContent = emailGenerator.passwordChangedEmail({
      firstName: admin.firstName,
      email: admin.email,
      changedAt: new Date().toISOString(),
    });
    queueTemplatedMail(admin.email, emailContent).catch(console.error);

    return null;
  }

  static async changeAdminEmail(adminId: string, data: any, ip: string, userAgent: string) {
    const { newEmail, password, otp } = data;

    if (!newEmail || !password || !otp) {
      throw new ValidationError("New email, password, and OTP are required");
    }

    const admin = await AdminUsers.findById(adminId);
    if (!admin) throw new NotFoundError("Admin not found");

    if (!verifyOtp(admin, otp, "email_change")) {
      admin.pendingOtp!.attempts = (admin.pendingOtp?.attempts || 0) + 1;
      await admin.save();
      throw new ValidationError("Invalid or expired OTP");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new UnauthorizedError("Password is incorrect");
    }

    const existing = await AdminUsers.findOne({
      email: newEmail.toLowerCase(),
    });
    if (existing) {
      throw new ValidationError("Email is already in use");
    }

    const oldEmail = admin.email;
    admin.email = newEmail.toLowerCase();
    admin.pendingOtp = undefined;
    admin.updatedAt = new Date();

    await admin.save();

    await AdminActionLogs.create({
      admin: adminId,
      action: "CHANGE_EMAIL",
      resource: "admin",
      resourceId: adminId,
      changes: { oldEmail, newEmail },
      ipAddress: ip || "",
      userAgent: userAgent || "",
      status: "success",
    });

    return null;
  }
}
