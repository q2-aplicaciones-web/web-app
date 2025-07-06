import { ref, computed } from 'vue';
import { env } from '../../env';

// Estado reactivo global para el usuario actual
const currentUser = ref(null);

export function useUserDomain() {
  // Devuelve el usuario actual como un valor computado
  const user = computed(() => currentUser.value);

  // Permite establecer el usuario actual (debe ser instancia de User)
  function setUser(userInstance) {
    currentUser.value = userInstance;
  }

  // El cambio de rol debe hacerse trayendo el usuario actualizado del backend
  // Esta función solo existe para compatibilidad, pero NO debe usarse para mutar el usuario localmente
  function setRole() {
    // No hacer nada
  }

  // Permite obtener el valor actual del usuario
  function getCurrentUser() {
    return currentUser.value;
  }

  return {
    currentUser: user,
    setUser,
    setRole,
    getCurrentUser,
  };
}