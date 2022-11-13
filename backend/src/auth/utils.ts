import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'


export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export function getToken(authHeader: string): string {

    if (!authHeader) {
      throw new Error('No authentication header');
    }
  
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
      throw new Error('Invalid authentication header');
    }
  
    const split = authHeader.split(' ');
    const token = split[1];
  
    return token;
}