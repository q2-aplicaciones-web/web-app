import { ref, computed } from 'vue';

// Estado reactivo global para el rol actual
const currentRole = ref(null);

export function useRoleDomain() {
  // Devuelve el rol actual como un valor computado
  const role = computed(() => currentRole.value);

  // Permite establecer el rol actual
  function setRole(role) {
    currentRole.value = role;
  }

  // Permite obtener el valor actual del rol
  function getCurrentRole() {
    return currentRole.value;
  }

  return {
    currentRole: role,
    setRole,
    getCurrentRole,
  };
}