import { AccessAssembler } from './access.assembler.js';

const API_BASE_URL = 'http://localhost:3000'; // O usa import.meta.env

export function useAccessService() {
  async function getAllAccess() {
    const res = await fetch(`${API_BASE_URL}/access`);
    const data = await res.json();
    return data.map(AccessAssembler.toEntity);
  }

  async function getAccessById(id) {
    const res = await fetch(`${API_BASE_URL}/access/${id}`);
    const data = await res.json();
    return AccessAssembler.toEntity(data);
  }

  async function createAccess(access) {
    const body = AccessAssembler.toResponse(access);
    const res = await fetch(`${API_BASE_URL}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return AccessAssembler.toEntity(data);
  }

  async function updateAccess(id, access) {
    const body = AccessAssembler.toResponse(access);
    const res = await fetch(`${API_BASE_URL}/access/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return AccessAssembler.toEntity(data);
  }

  async function deleteAccess(id) {
    await fetch(`${API_BASE_URL}/access/${id}`, {
      method: 'DELETE'
    });
  }

  return {
    getAllAccess,
    getAccessById,
    createAccess,
    updateAccess,
    deleteAccess
  };
}