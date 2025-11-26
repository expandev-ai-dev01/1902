/**
 * @summary
 * Client registration endpoint controller.
 * Handles new client registration with validation and email verification.
 *
 * @api {post} /api/v1/external/client/register Register New Client
 * @apiName RegisterClient
 * @apiGroup Client
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new client account with personal information and address
 *
 * @apiParam {String} fullName Client full name (5-100 characters)
 * @apiParam {String} cpf Client CPF (11 digits)
 * @apiParam {String} email Client email address
 * @apiParam {String} phone Client phone with DDD (10-11 digits)
 * @apiParam {String} birthDate Client birth date (YYYY-MM-DD)
 * @apiParam {String} zipCode Address ZIP code (8 digits)
 * @apiParam {String} street Street name
 * @apiParam {String} number Address number
 * @apiParam {String} [complement] Address complement
 * @apiParam {String} neighborhood Neighborhood name
 * @apiParam {String} city City name
 * @apiParam {String} state State code (2 letters)
 * @apiParam {String} password Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)
 * @apiParam {String} confirmPassword Password confirmation
 * @apiParam {Boolean} acceptTerms Terms acceptance
 *
 * @apiSuccess {Number} idClient Client identifier
 * @apiSuccess {String} verificationToken Email verification token
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} cpfAlreadyRegistered CPF already exists
 * @apiError {String} emailAlreadyRegistered Email already exists
 * @apiError {String} minimumAgeRequired Client must be 18 years or older
 * @apiError {String} ipBlocked IP temporarily blocked due to excessive attempts
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { clientCreate } from '@/services/client';
import { successResponse, errorResponse } from '@/utils/response';

/**
 * @rule {be-zod-validation}
 * Request body validation schema
 */
const bodySchema = z
  .object({
    fullName: z
      .string()
      .min(5, 'fullNameTooShort')
      .max(100, 'fullNameTooLong')
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'fullNameInvalidCharacters')
      .refine((val) => val.trim().split(/\s+/).length >= 2, 'fullNameMissingLastName'),
    cpf: z
      .string()
      .length(11, 'cpfInvalidLength')
      .regex(/^\d{11}$/, 'cpfInvalidFormat'),
    email: z.string().email('emailInvalid').max(100, 'emailTooLong'),
    phone: z
      .string()
      .min(10, 'phoneInvalidLength')
      .max(11, 'phoneInvalidLength')
      .regex(/^\d{10,11}$/, 'phoneInvalidFormat'),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDateInvalidFormat'),
    zipCode: z
      .string()
      .length(8, 'zipCodeInvalidLength')
      .regex(/^\d{8}$/, 'zipCodeInvalidFormat'),
    street: z.string().min(1, 'streetRequired').max(100, 'streetTooLong'),
    number: z.string().min(1, 'numberRequired').max(10, 'numberTooLong'),
    complement: z.string().max(50, 'complementTooLong').optional(),
    neighborhood: z.string().min(1, 'neighborhoodRequired').max(50, 'neighborhoodTooLong'),
    city: z.string().min(1, 'cityRequired').max(50, 'cityTooLong'),
    state: z
      .string()
      .length(2, 'stateInvalidLength')
      .regex(
        /^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/,
        'stateInvalid'
      ),
    password: z
      .string()
      .min(8, 'passwordTooShort')
      .regex(/[A-Z]/, 'passwordMissingUppercase')
      .regex(/[a-z]/, 'passwordMissingLowercase')
      .regex(/[0-9]/, 'passwordMissingNumber')
      .regex(/[^A-Za-z0-9]/, 'passwordMissingSpecialChar'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, 'termsNotAccepted'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordsDoNotMatch',
    path: ['confirmPassword'],
  });

/**
 * @summary
 * Handles client registration POST request
 *
 * @function postHandler
 * @module api/v1/external/client/register/controller
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @returns {Promise<void>}
 */
export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    /**
     * @validation Request body validation
     */
    const validatedData = bodySchema.parse(req.body);

    /**
     * @rule {be-ip-capture}
     * Capture client IP address
     */
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';

    /**
     * @rule {fn-client-registration}
     * Execute client registration
     */
    const result = await clientCreate({
      fullName: validatedData.fullName,
      cpf: validatedData.cpf,
      email: validatedData.email,
      phone: validatedData.phone,
      birthDate: validatedData.birthDate,
      zipCode: validatedData.zipCode,
      street: validatedData.street,
      number: validatedData.number,
      complement: validatedData.complement,
      neighborhood: validatedData.neighborhood,
      city: validatedData.city,
      state: validatedData.state,
      password: validatedData.password,
      termsVersion: '1.0.0',
      ipAddress,
    });

    res.status(201).json(successResponse(result));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json(errorResponse(error.errors[0].message, 'VALIDATION_ERROR'));
    } else if (
      [
        'cpfAlreadyRegistered',
        'emailAlreadyRegistered',
        'minimumAgeRequired',
        'ipBlocked',
      ].includes(error.message)
    ) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(error);
    }
  }
}
