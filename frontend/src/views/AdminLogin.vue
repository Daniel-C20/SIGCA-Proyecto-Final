<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const submitting = ref(false);

async function submit() {
  error.value = '';
  submitting.value = true;
  try {
    const user = await auth.login(email.value, password.value);
    if (user.role !== 'ADMINISTRADOR') {
      auth.logout();
      throw new Error('Esta consola está habilitada únicamente para el rol administrador.');
    }
    await router.replace(typeof route.query.next === 'string' ? route.query.next : { name: 'admin' });
  } catch (caught) {
    error.value = caught.message;
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-visual"><div class="login-visual-shape shape-a"></div><div class="login-visual-shape shape-b"></div><RouterLink class="brand login-brand" to="/"><span class="brand-mark"><span></span><span></span><span></span></span><span class="brand-copy"><strong>centro integral</strong><small>de atención</small></span></RouterLink><div class="login-message"><span class="section-kicker">ESPACIO DE EQUIPO</span><h1>Un buen cuidado<br />también comienza<br /><em>por dentro.</em></h1><p>Herramientas sencillas para organizar la atención del centro.</p></div><span class="login-visual-foot">SIGCA · AVANCE 1</span></section>
    <section class="login-panel"><RouterLink to="/" class="back-link">← Volver al portal</RouterLink><div class="login-form-wrap"><span class="section-kicker">ACCESO ADMINISTRATIVO</span><h2>Bienvenido<br /><em>de nuevo.</em></h2><p>Ingresa con tus credenciales para continuar.</p><form @submit.prevent="submit"><label for="email">Correo electrónico</label><input id="email" v-model="email" type="email" autocomplete="username" required placeholder="nombre@centro.com" /><label for="password">Contraseña</label><input id="password" v-model="password" type="password" autocomplete="current-password" required minlength="1" placeholder="Tu contraseña" /><p v-if="error" class="form-error" role="alert">{{ error }}</p><button class="button button-dark login-submit" type="submit" :disabled="submitting">{{ submitting ? 'Ingresando...' : 'Ingresar al panel' }} <span>↗</span></button></form><p class="login-help">Las credenciales de demostración se configuran en el backend.</p></div><span class="login-panel-foot">© 2026 Centro Integral de Atención</span></section>
  </main>
</template>
