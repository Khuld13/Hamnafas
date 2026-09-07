import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const BCRYPT_COST = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(userId: string): string {
  if (!config.jwtSecret) {
    throw new Error('Cannot sign token: JWT_SECRET is not configured.');
  }
  return jwt.sign({ sub: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): { sub: string } | null {
  if (!config.jwtSecret) {
    return null;
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string };
    return payload;
  } catch {
    return null;
  }
}
