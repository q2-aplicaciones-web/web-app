// src/iam/services/user.service.js
import { env } from '../../env.js';

export async function getUserById(userId, token) {
  const res = await fetch(`${env.apiBaseUrl}/api/v1/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error fetching user');
  return await res.json();
}
