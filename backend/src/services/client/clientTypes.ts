/**
 * @summary
 * Type definitions for client registration and management.
 * Defines interfaces for client data, registration requests, and responses.
 *
 * @module services/client/clientTypes
 */

/**
 * @interface ClientCreateRequest
 * @description Request parameters for client registration
 */
export interface ClientCreateRequest {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  password: string;
  termsVersion: string;
  ipAddress: string;
}

/**
 * @interface ClientCreateResponse
 * @description Response data from client registration
 */
export interface ClientCreateResponse {
  idClient: number;
  verificationToken: string;
}

/**
 * @interface EmailVerificationRequest
 * @description Request parameters for email verification
 */
export interface EmailVerificationRequest {
  token: string;
}

/**
 * @interface EmailVerificationResponse
 * @description Response data from email verification
 */
export interface EmailVerificationResponse {
  idClient: number;
  email: string;
}

/**
 * @interface ResendVerificationRequest
 * @description Request parameters for resending verification email
 */
export interface ResendVerificationRequest {
  email: string;
  ipAddress: string;
}

/**
 * @interface ResendVerificationResponse
 * @description Response data from resend verification
 */
export interface ResendVerificationResponse {
  verificationToken: string;
}

/**
 * @enum ClientStatus
 * @description Client account status values
 */
export enum ClientStatus {
  Inactive = 0,
  Active = 1,
  Blocked = 2,
}

/**
 * @enum ClientProfile
 * @description Client profile/role values
 */
export enum ClientProfile {
  Client = 0,
  Analyst = 1,
  Administrator = 2,
}
