<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiRequest, listServices } from '../services/api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();
const services = ref([]);
const loading = ref(true);
const error = ref('');
const notice = ref('');
const saving = ref(false);
const showForm = ref(false);
const editingId = ref('');
const form = ref(blankForm());
const money = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 0 });
const activeCount = computed(() => services.value.filter((service) => service.isActive).length);

function blankForm() { return { name: '', description: '', durationMinutes: 45, price: 0, imageUrl: '', isActive: true }; }

async function refresh() {
  loading.value = true;
  error.value = '';
  try { services.value = (await listServices('TODOS', auth.token)).items; }
  catch (caught) { error.value = caught.message; }
  finally { loading.value = false; }
}

function openCreate() { editingId.value = ''; form.value = blankForm(); showForm.value = true; }
function openEdit(service) { editingId.value = service._id; form.value = { name: service.name, description: service.description, durationMinutes: service.durationMinutes, price: service.price, imageUrl: service.imageUrl || '', isActive: service.isActive }; showForm.value = true; }

async function saveService() {
  error.value = '';
  notice.value = '';
  saving.value = true;
  try {
    const path = editingId.value ? `/servicios/${editingId.value}` : '/servicios';
    const data = await apiRequest(path, { token: auth.token, method: editingId.value ? 'PUT' : 'POST', body: JSON.stringify(form.value) });
    notice.value = editingId.value ? `Se actualizó “${data.service.name}”.` : `Se creó “${data.service.name}”.`;
    showForm.value = false;
    await refresh();
  } catch (caught) { error.value = caught.message; }
  finally { saving.value = false; }
}

async function toggleStatus(service) {
  error.value = '';
  notice.value = '';
  try {
    const data = await apiRequest(`/servicios/${service._id}/estado`, { token: auth.token, method: 'PATCH', body: JSON.stringify({ isActive: !service.isActive }) });
    notice.value = `“${data.service.name}” quedó ${data.service.isActive ? 'activo' : 'inactivo'}.`;
    await refresh();
  } catch (caught) { error.value = caught.message; }
}

async function signOut() { auth.logout(); await router.replace({ name: 'home' }); }

onMounted(refresh);
</script>

<template>
  <main class="admin-shell">
    <aside class="admin-sidebar"><RouterLink class="brand admin-brand" to="/"><span class="brand-mark"><span></span><span></span><span></span></span><span class="brand-copy"><strong>centro integral</strong><small>de atención</small></span></RouterLink><span class="sidebar-label">ADMINISTRACIÓN</span><a class="sidebar-link active" href="#servicios"><span>✳</span> Servicios</a><a class="sidebar-link disabled" aria-disabled="true"><span>◷</span> Pacientes <small>próxima etapa</small></a><a class="sidebar-link disabled" aria-disabled="true"><span>▦</span> Citas <small>próxima etapa</small></a><div class="sidebar-bottom"><span class="sidebar-label">CUENTA</span><div class="user-mini"><span class="user-avatar">{{ auth.user?.name?.slice(0, 1) || 'A' }}</span><span><strong>{{ auth.user?.name }}</strong><small>Administrador</small></span></div><button class="signout-button" @click="signOut">Cerrar sesión <span>↗</span></button></div></aside>
    <section class="admin-main"><header class="admin-topbar"><div><span class="section-kicker">PANEL DE CONTROL</span><p>Centro Integral de Atención <span>·</span> Guatemala</p></div><RouterLink to="/" class="view-site">Ver portal público ↗</RouterLink></header><div class="admin-content"><div class="admin-welcome"><div><span class="section-kicker">HOLA, {{ auth.user?.name?.split(' ')[0] || 'EQUIPO' }}</span><h1>Un centro que<br /><em>crece contigo.</em></h1></div><span class="demo-pill"><i></i> Entorno de demostración</span></div>
      <div class="admin-summary"><article><span>Servicios registrados</span><strong>{{ services.length }}</strong><small>Datos de MongoDB</small></article><article><span>Servicios activos</span><strong>{{ activeCount }}</strong><small>Visibles en el portal público</small></article><article><span>Etapa del proyecto</span><strong class="stage-value">Avance 1</strong><small>Servicios y acceso administrativo</small></article></div>
      <section id="servicios" class="admin-services"><div class="admin-section-heading"><div><span class="section-kicker">CATÁLOGO DEL CENTRO</span><h2>Servicios</h2><p>Los cambios se guardan directamente en la base de datos.</p></div><button class="button button-dark" @click="openCreate">Nuevo servicio <span>＋</span></button></div>
        <div v-if="notice" class="admin-alert success-alert" role="status">{{ notice }}</div><div v-if="error" class="admin-alert error-alert" role="alert">{{ error }}</div>
        <div v-if="showForm" class="service-editor"><div class="editor-heading"><div><span class="section-kicker">{{ editingId ? 'ACTUALIZAR SERVICIO' : 'NUEVO REGISTRO' }}</span><h3>{{ editingId ? 'Editar servicio' : 'Crear servicio' }}</h3></div><button class="icon-close" aria-label="Cerrar formulario" @click="showForm = false">×</button></div><form class="service-form" @submit.prevent="saveService"><label>Nombre<input v-model.trim="form.name" required minlength="2" maxlength="100" /></label><label>Duración (minutos)<input v-model.number="form.durationMinutes" type="number" required min="1" max="1440" step="1" /></label><label>Precio (Q)<input v-model.number="form.price" type="number" required min="0" max="100000" step="0.01" /></label><label>Imagen (ruta o URL)<input v-model.trim="form.imageUrl" maxlength="500" placeholder="/images/servicio.svg" /></label><label class="full-field">Descripción<textarea v-model.trim="form.description" required minlength="10" maxlength="1200" rows="3"></textarea></label><label class="active-toggle"><input v-model="form.isActive" type="checkbox" /> Servicio activo y visible al público</label><div class="editor-actions"><button class="button button-outline" type="button" @click="showForm = false">Cancelar</button><button class="button button-dark" type="submit" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar servicio' }} <span>↗</span></button></div></form></div>
        <div v-if="loading" class="table-state" role="status"><span class="loader"></span> Cargando servicios desde la API...</div><div v-else-if="services.length === 0" class="table-state">Aún no hay servicios. Crea el primero para publicarlo.</div><div v-else class="services-table-wrap"><table class="services-table"><thead><tr><th>Servicio</th><th>Duración</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody><tr v-for="service in services" :key="service._id"><td><div class="table-service"><span class="table-service-icon">✳</span><span><strong>{{ service.name }}</strong><small>{{ service.description }}</small></span></div></td><td>{{ service.durationMinutes }} min</td><td>{{ money.format(service.price) }}</td><td><span class="status-chip" :class="service.isActive ? 'status-active' : 'status-inactive'"><i></i>{{ service.isActive ? 'Activo' : 'Inactivo' }}</span></td><td><div class="row-actions"><button class="table-action" @click="openEdit(service)">Editar</button><button class="table-action" @click="toggleStatus(service)">{{ service.isActive ? 'Desactivar' : 'Activar' }}</button></div></td></tr></tbody></table></div>
      </section><p class="admin-footnote">Las secciones de pacientes y citas están reservadas para futuras etapas del proyecto.</p></div></section>
  </main>
</template>
