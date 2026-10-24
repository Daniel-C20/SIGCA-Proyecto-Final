<script setup>
import { computed, onMounted, ref } from 'vue';
import { listServices } from '../services/api';

const slides = [
  { image: '/images/center-welcome.svg', eyebrow: 'Un espacio para ti', title: 'Cada proceso merece ser escuchado.', text: 'Atención cercana para acompañarte a ti y a tu familia, paso a paso.' },
  { image: '/images/center-care.svg', eyebrow: 'Atención integral', title: 'Cuidar también es avanzar.', text: 'Un lugar tranquilo donde sentirte acompañado hace parte del camino.' },
  { image: '/images/center-growth.svg', eyebrow: 'Crecemos contigo', title: 'Pequeños avances, grandes caminos.', text: 'Acompañamos cada etapa con respeto, escucha y atención profesional.' },
  { image: '/images/center-listen.svg', eyebrow: 'Comunicación y bienestar', title: 'Encontrar tu voz también es florecer.', text: 'Creamos oportunidades para conectar, expresar y descubrir nuevas posibilidades.' },
  { image: '/images/center-family.svg', eyebrow: 'Contigo y tu familia', title: 'El bienestar se construye en compañía.', text: 'Cada familia tiene su propio ritmo. Estamos aquí para acompañar el proceso.' },
];
const activeSlide = ref(0);
const slide = computed(() => slides[activeSlide.value]);
const services = ref([]);
const serviceState = ref('loading');
const serviceError = ref('');
const contactMessage = ref('');
const contactForm = ref({ name: '', email: '', message: '' });
const money = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 0 });

function moveSlide(direction) {
  activeSlide.value = (activeSlide.value + direction + slides.length) % slides.length;
}

async function loadServices() {
  serviceState.value = 'loading';
  serviceError.value = '';
  try {
    const data = await listServices();
    services.value = data.items;
    serviceState.value = 'ready';
  } catch (error) {
    serviceState.value = 'error';
    serviceError.value = error.message;
  }
}

function validateContact() {
  contactMessage.value = 'Los datos están completos. El envío de mensajes estará disponible en una siguiente etapa.';
}

onMounted(loadServices);
</script>

<template>
  <div class="site-shell">
    <div class="topline"><span>Contenido institucional provisional · Proyecto académico</span><a href="#contacto">Conversemos <span aria-hidden="true">↗</span></a></div>
    <header class="site-header">
      <a class="brand" href="#inicio" aria-label="Centro Integral de Atención, inicio">
        <span class="brand-mark"><span></span><span></span><span></span></span>
        <span class="brand-copy"><strong>centro integral</strong><small>de atención</small></span>
      </a>
      <nav class="main-nav" aria-label="Navegación principal">
        <a href="#nosotros">Nosotros</a><a href="#servicios">Servicios</a><a href="#horarios">Horarios</a>
        <a href="#contacto">Contacto</a>
      </nav>
      <RouterLink class="header-cta" to="/admin/login">Portal de equipo <span aria-hidden="true">↗</span></RouterLink>
    </header>

    <main>
      <section id="inicio" class="hero" aria-label="Presentación del centro">
        <div class="hero-copy">
          <span class="eyebrow"><i></i>{{ slide.eyebrow }}</span>
          <h1>{{ slide.title }}</h1>
          <p>{{ slide.text }}</p>
          <div class="hero-actions"><a class="button button-dark" href="#solicitar">Conoce cómo iniciar <span aria-hidden="true">↗</span></a><a class="text-link" href="#servicios">Explorar servicios <span aria-hidden="true">↓</span></a></div>
          <div class="hero-controls" aria-label="Controles de presentación">
            <button aria-label="Imagen anterior" @click="moveSlide(-1)">←</button>
            <div class="slide-dots"><button v-for="(_, index) in slides" :key="index" :aria-label="`Ver imagen ${index + 1}`" :aria-current="activeSlide === index ? 'true' : undefined" :class="{ selected: activeSlide === index }" @click="activeSlide = index"></button></div>
            <span class="slide-count">0{{ activeSlide + 1 }} <i>/</i> 0{{ slides.length }}</span>
            <button aria-label="Imagen siguiente" @click="moveSlide(1)">→</button>
          </div>
        </div>
        <div class="hero-art">
          <div class="art-stamp"><span>✳</span><small>Tu bienestar<br />nos importa</small></div>
          <img :src="slide.image" :alt="slide.eyebrow" />
          <div class="art-caption"><span>0{{ activeSlide + 1 }} — 05</span><span>Atención con calidez</span></div>
        </div>
        <div class="hero-index"><span>GUA</span><i></i><span>01</span></div>
      </section>

      <section class="intro-strip" aria-label="Presentación">
        <span class="section-kicker">UNA ATENCIÓN MÁS HUMANA</span>
        <p>Creemos en una atención que <em>escucha, comprende</em><br class="desktop-break" /> y acompaña cada historia con respeto.</p>
        <span class="intro-symbol" aria-hidden="true">✳</span>
      </section>

      <section id="nosotros" class="about section-wrap">
        <div class="section-heading"><span class="section-kicker">UN LUGAR PARA CONECTAR</span><h2>Bienestar que se siente<br /><em>cercano.</em></h2></div>
        <p class="about-copy">Somos un centro de atención integral con espacios de acompañamiento psicológico, desarrollo de la comunicación y orientación familiar. Cada persona merece ser atendida con paciencia, dignidad y atención a su propio ritmo.</p>
        <div class="values-row">
          <article class="value-card"><span class="value-number">01</span><span class="value-icon icon-sun">✳</span><h3>Nuestra misión</h3><p>Ofrecer atención cercana y respetuosa que favorezca el bienestar emocional, la comunicación y el desarrollo integral.</p></article>
          <article class="value-card"><span class="value-number">02</span><span class="value-icon icon-leaf">⌁</span><h3>Nuestra visión</h3><p>Ser un espacio de confianza y referencia por la calidad humana y el acompañamiento a personas y familias.</p></article>
          <div class="values-note"><span>Un lugar donde<br />cada paso cuenta.</span><i aria-hidden="true">↘</i></div>
        </div>
      </section>

      <section id="servicios" class="services-section">
        <div class="section-wrap">
          <div class="services-heading"><div><span class="section-kicker">ATENCIÓN CON PROPÓSITO</span><h2>Servicios para<br /><em>cada proceso.</em></h2></div><p>Conoce las opciones de acompañamiento disponibles. La información se consulta directamente desde nuestro sistema.</p></div>
          <div v-if="serviceState === 'loading'" class="service-state" role="status"><span class="loader"></span><p>Cargando servicios...</p></div>
          <div v-else-if="serviceState === 'error'" class="service-state error-state" role="alert"><p>{{ serviceError }}</p><button class="text-link" @click="loadServices">Intentar de nuevo ↗</button></div>
          <div v-else-if="services.length === 0" class="service-state"><p>Por el momento no hay servicios activos publicados.</p></div>
          <div v-else class="service-grid">
            <article v-for="(service, index) in services" :key="service._id" class="service-card">
              <div class="service-image" :class="`service-color-${index % 4}`">
                <img v-if="service.imageUrl" :src="service.imageUrl" :alt="`Ilustración de ${service.name}`" @error="$event.target.style.display = 'none'; $event.target.parentElement.classList.add('image-load-failed')" />
                <span v-else class="service-fallback" aria-hidden="true">✳</span>
                <span class="service-index">0{{ index + 1 }}</span>
              </div>
              <div class="service-card-body"><div class="service-meta"><span>{{ service.durationMinutes }} min</span><span>{{ money.format(service.price) }}</span></div><h3>{{ service.name }}</h3><p>{{ service.description }}</p><a href="#solicitar" class="service-link" :aria-label="`Consultar sobre ${service.name}`">Consultar servicio <span>↗</span></a></div>
            </article>
          </div>
          <div class="provisional-note"><span class="note-dot"></span> Servicios, precios y descripciones son información de demostración.</div>
        </div>
      </section>

      <section id="horarios" class="visit-section section-wrap">
        <div class="visit-copy"><span class="section-kicker">ESTAMOS PARA ACOMPAÑARTE</span><h2>Un espacio pensado<br />para <em>sentirte bien.</em></h2><p>Estamos preparando cada detalle para recibirte. Escríbenos para conocer más sobre los servicios y los siguientes pasos.</p><a href="#contacto" class="button button-dark">Conversemos <span>↗</span></a></div>
        <div class="visit-card"><span class="visit-sun" aria-hidden="true">✳</span><div class="visit-card-title"><span>INFORMACIÓN PROVISIONAL</span><h3>Horarios de atención</h3></div><div class="hours-row"><span>Lunes a viernes</span><strong>8:00 — 17:00</strong></div><div class="hours-row"><span>Sábado</span><strong>8:00 — 12:00</strong></div><div class="hours-row"><span>Domingo</span><strong class="closed">Cerrado</strong></div><p>Los horarios mostrados son provisionales y deben confirmarse con el centro.</p></div>
      </section>

      <section id="solicitar" class="appointment-banner"><div class="banner-orbit orbit-one"></div><div class="banner-orbit orbit-two"></div><div class="banner-content"><span class="section-kicker">EL SIGUIENTE PASO COMIENZA AQUÍ</span><h2>Estamos listos para<br />escucharte.</h2><p>Las solicitudes de cita se habilitarán en la siguiente etapa del proyecto. Por ahora puedes conocer nuestros servicios y dejarnos tus datos de contacto.</p><a href="#contacto" class="button button-light">Ir al contacto <span>↗</span></a></div><div class="banner-mark" aria-hidden="true">✳</div></section>

      <section id="contacto" class="contact-section section-wrap">
        <div class="contact-intro"><span class="section-kicker">HABLEMOS</span><h2>Tu historia<br /><em>importa.</em></h2><p>Esta información de contacto es provisional para la demostración académica.</p><div class="contact-detail"><span>Correo provisional</span><a href="mailto:contacto@centro.example">contacto@centro.example ↗</a></div><div class="contact-detail"><span>Teléfono provisional</span><strong>+502 0000 0000</strong></div><div class="contact-detail"><span>Ubicación</span><strong>Guatemala, Guatemala</strong></div></div>
        <form class="contact-form" @submit.prevent="validateContact"><div class="form-kicker"><span>01 / 03</span><span>Formulario informativo</span></div><label for="contact-name">Tu nombre</label><input id="contact-name" v-model="contactForm.name" autocomplete="name" required minlength="2" placeholder="¿Cómo te llamas?" />
          <label for="contact-email">Correo electrónico</label><input id="contact-email" v-model="contactForm.email" type="email" autocomplete="email" required placeholder="nombre@correo.com" />
          <label for="contact-message">¿Cómo podemos ayudarte?</label><textarea id="contact-message" v-model="contactForm.message" required minlength="10" rows="3" placeholder="Cuéntanos un poco... "></textarea>
          <button class="button button-dark form-submit" type="submit">Validar información <span>↗</span></button><p class="form-disclaimer" aria-live="polite">{{ contactMessage || 'Este formulario no envía ni almacena datos todavía.' }}</p>
        </form>
      </section>
    </main>

    <footer class="site-footer"><a class="brand footer-brand" href="#inicio"><span class="brand-mark"><span></span><span></span><span></span></span><span class="brand-copy"><strong>centro integral</strong><small>de atención</small></span></a><span>Un espacio para escuchar y crecer.</span><span>© 2026 · Proyecto SIGCA · Contenido provisional</span><RouterLink to="/admin/login" class="footer-admin">Acceso de equipo ↗</RouterLink></footer>
  </div>
</template>

<style scoped>
.service-image.image-load-failed::after {
  content: '✳';
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #718b70;
  font-size: 34px;
}
</style>
