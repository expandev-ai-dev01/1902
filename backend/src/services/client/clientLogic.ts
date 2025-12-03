/**
 * @summary
 * Business logic for client registration and email verification.
 * Handles password hashing, validation, and data transformation.
 *
 * @module services/client/clientLogic
 */

import {
  ClientCreateRequest,
  ClientCreateResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
} from './clientTypes';

/**
 * @summary
 * In-memory storage for clients (temporary implementation)
 */
const clients: any[] = [];
const verificationTokens: Map<string, any> = new Map();
const registrationAttempts: Map<string, any> = new Map();

/**
 * @summary
 * Simple password hashing (replace with bcrypt in production)
 */
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

/**
 * @summary
 * Generate verification token
 */
function generateToken(email: string): string {
  return Buffer.from(`${email}-${Date.now()}-${Math.random()}`).toString('base64');
}

/**
 * @summary
 * Calculate age from birth date
 */
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * @summary
 * Check IP rate limiting
 */
function checkIpRateLimit(ipAddress: string): void {
  const attempt = registrationAttempts.get(ipAddress);
  const now = new Date();

  if (attempt) {
    if (attempt.blockedUntil && attempt.blockedUntil > now) {
      throw new Error('ipBlocked');
    }

    const minutesSinceLastAttempt = (now.getTime() - attempt.lastAttemptDate.getTime()) / 60000;

    if (minutesSinceLastAttempt <= 10) {
      attempt.attemptCount++;
      if (attempt.attemptCount >= 5) {
        attempt.blockedUntil = new Date(now.getTime() + 30 * 60000);
        throw new Error('ipBlocked');
      }
    } else {
      attempt.attemptCount = 1;
    }

    attempt.lastAttemptDate = now;
  } else {
    registrationAttempts.set(ipAddress, {
      attemptCount: 1,
      lastAttemptDate: now,
      blockedUntil: null,
    });
  }
}

/**
 * @summary
 * Creates a new client registration
 *
 * @function clientCreate
 * @module services/client/clientLogic
 *
 * @param {ClientCreateRequest} params - Client registration parameters
 *
 * @returns {Promise<ClientCreateResponse>} Created client data with verification token
 *
 * @throws {Error} When validation fails or duplicate data exists
 */
export async function clientCreate(params: ClientCreateRequest): Promise<ClientCreateResponse> {
  /**
   * @validation IP rate limiting check
   */
  checkIpRateLimit(params.ipAddress);

  /**
   * @validation Age requirement check
   */
  const age = calculateAge(params.birthDate);
  if (age < 18) {
    throw new Error('minimumAgeRequired');
  }

  /**
   * @validation CPF uniqueness check
   */
  if (clients.some((c) => c.cpf === params.cpf)) {
    throw new Error('cpfAlreadyRegistered');
  }

  /**
   * @validation Email uniqueness check
   */
  if (clients.some((c) => c.email === params.email)) {
    throw new Error('emailAlreadyRegistered');
  }

  /**
   * @rule {fn-client-creation} Create client record
   */
  const passwordHash = hashPassword(params.password);
  const idClient = clients.length + 1;
  const verificationToken = generateToken(params.email);

  const client = {
    idClient,
    fullName: params.fullName,
    cpf: params.cpf,
    email: params.email,
    phone: params.phone,
    birthDate: params.birthDate,
    passwordHash,
    status: 1,
    profile: 0,
    emailVerified: false,
    termsVersion: params.termsVersion,
    registrationDate: new Date().toISOString(),
    registrationIp: params.ipAddress,
    address: {
      zipCode: params.zipCode,
      street: params.street,
      number: params.number,
      complement: params.complement,
      neighborhood: params.neighborhood,
      city: params.city,
      state: params.state,
    },
  };

  clients.push(client);

  /**
   * @rule {fn-verification-token} Store verification token
   */
  verificationTokens.set(verificationToken, {
    idClient,
    email: params.email,
    generatedDate: new Date(),
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    used: false,
  });

  return {
    idClient,
    verificationToken,
  };
}

/**
 * @summary
 * Verifies client email using token
 *
 * @function clientVerifyEmail
 * @module services/client/clientLogic
 *
 * @param {EmailVerificationRequest} params - Verification parameters
 *
 * @returns {Promise<EmailVerificationResponse>} Verified client data
 *
 * @throws {Error} When token is invalid, expired, or already used
 */
export async function clientVerifyEmail(
  params: EmailVerificationRequest
): Promise<EmailVerificationResponse> {
  /**
   * @validation Token existence check
   */
  const tokenData = verificationTokens.get(params.token);
  if (!tokenData) {
    throw new Error('invalidToken');
  }

  /**
   * @validation Token already used check
   */
  if (tokenData.used) {
    throw new Error('tokenAlreadyUsed');
  }

  /**
   * @validation Token expiration check
   */
  if (tokenData.expirationDate < new Date()) {
    throw new Error('tokenExpired');
  }

  /**
   * @rule {fn-email-verification} Update client verification status
   */
  const client = clients.find((c) => c.idClient === tokenData.idClient);
  if (client) {
    client.emailVerified = true;
    tokenData.used = true;
  }

  return {
    idClient: tokenData.idClient,
    email: tokenData.email,
  };
}

/**
 * @summary
 * Resends email verification token
 *
 * @function clientResendVerification
 * @module services/client/clientLogic
 *
 * @param {ResendVerificationRequest} params - Resend request parameters
 *
 * @returns {Promise<ResendVerificationResponse>} New verification token
 *
 * @throws {Error} When email not found, already verified, or daily limit exceeded
 */
export async function clientResendVerification(
  params: ResendVerificationRequest
): Promise<ResendVerificationResponse> {
  /**
   * @validation Email existence check
   */
  const client = clients.find((c) => c.email === params.email);
  if (!client) {
    throw new Error('emailNotFound');
  }

  /**
   * @validation Email already verified check
   */
  if (client.emailVerified) {
    throw new Error('emailAlreadyVerified');
  }

  /**
   * @rule {fn-token-regeneration} Generate new token
   */
  const verificationToken = generateToken(params.email);

  verificationTokens.set(verificationToken, {
    idClient: client.idClient,
    email: params.email,
    generatedDate: new Date(),
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    used: false,
  });

  return {
    verificationToken,
  };
}

/**
 * @summary
 * Retrieves a client by ID
 *
 * @function getClientById
 * @module services/client/clientLogic
 *
 * @param {number} id - Client identifier
 * @returns {any | undefined} Client object or undefined if not found
 */
export function getClientById(id: number): any {
  return clients.find((c) => c.idClient === id);
}
