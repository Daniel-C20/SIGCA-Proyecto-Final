# SIGCA — Avance 1

Primera etapa ejecutable del **Sistema Integral de Gestión de Citas y Atención**. Incluye un portal público que consulta el catálogo de servicios en MongoDB, acceso administrativo con JWT y operaciones para registrar, consultar, editar y activar/desactivar servicios.

El nombre, los textos institucionales, horarios, medios de contacto y servicios de ejemplo son contenido provisional para la demostración académica. Se identifican en el portal y pueden sustituirse en `frontend/src/views/PublicHome.vue`; los servicios iniciales están definidos en `backend/src/scripts/seed.js`. No se guardan datos de pacientes reales. La aplicación no ofrece todavía registro de citas ni envío de mensajes desde el formulario público.

## Tecnologías

- Frontend: Vue 3, Vite, Vue Router y Pinia.
- Backend: Node.js 20+, Express 5 y Mongoose.
- Persistencia: MongoDB.
- Acceso: JWT y contraseñas con bcryptjs.

## Estructura

```text
backend/
  src/
    config/       variables de entorno y conexión MongoDB
    controllers/  autenticación y catálogo de servicios
    middleware/   autenticación, roles y errores
    models/       usuario, paciente, responsable, profesional, servicio y cita
    routes/       endpoints REST
    scripts/      datos de demostración
  tests/          validaciones de modelos e integración con MongoDB
frontend/
  public/images/  ilustraciones SVG locales del portal y servicios
  src/
    router/       rutas públicas y guardas administrativas
    services/     cliente REST
    stores/       estado de autenticación Pinia
    views/        portal, inicio de sesión y administración
    styles.css    estilos responsive
```

## Requisitos previos

- Node.js 20 o posterior y npm.
- Una instancia de MongoDB local o Atlas con acceso de red configurado.
- Una base de datos vacía o dedicada al proyecto.

## Instalación y configuración

Desde la carpeta raíz del proyecto, en dos terminales:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edita `backend/.env`. `MONGODB_URI` debe apuntar a una instancia MongoDB a la que el equipo tenga acceso. Antes de compartirlo, reemplaza `JWT_SECRET` por al menos 32 caracteres aleatorios y mantén `.env` fuera de Git. Los campos `SEED_ADMIN_*` son credenciales **ficticias de demostración** y también deben cambiarse para cualquier entorno compartido.

Ejemplo local:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/sigca
JWT_SECRET=un-secreto-local-de-al-menos-32-caracteres
SEED_ADMIN_EMAIL=admin@sigca.demo
SEED_ADMIN_PASSWORD=SIGCA-Demo-2026!
```

Si utilizan MongoDB Atlas, creen un clúster y un usuario de base de datos, agreguen la IP actual del equipo a **Network Access**, copien el URI de conexión y sustituyan `<password>` por la contraseña del usuario de base de datos. Añadan el nombre `sigca` al final de la ruta de la base, por ejemplo `mongodb+srv://usuario:contraseña@cluster.example.mongodb.net/sigca`. Si la contraseña contiene caracteres reservados, codifíquenlos para URL. Peguen el URI únicamente en `backend/.env`; no lo compartan ni lo suban al repositorio. Compass por sí solo es un cliente gráfico y no sustituye a una instancia MongoDB.

Instala el frontend en otra terminal:

```powershell
cd frontend
npm install
```

El frontend usa `/api` y Vite lo dirige a `http://localhost:4000`. No se necesita `frontend/.env` para el caso predeterminado. Si el backend está en otra dirección, copia `frontend/.env.example` a `frontend/.env` y configura `VITE_API_PROXY_TARGET` y, cuando corresponda, `VITE_API_BASE_URL`.

## Arranque y datos de demostración

Primero crea el administrador y cuatro servicios de ejemplo (se puede repetir sin duplicarlos):

```powershell
cd backend
npm run seed
```

Luego, manteniendo MongoDB disponible, inicia la API:

```powershell
cd backend
npm run dev
```

En otra terminal, inicia Vue:

```powershell
cd frontend
npm run dev
```

Abre `http://localhost:5173`. El panel está en `http://localhost:5173/admin/login`.

Credenciales iniciales ficticias de `.env.example`:

- Correo: `admin@sigca.demo`
- Contraseña: `SIGCA-Demo-2026!`

El script crea el usuario solamente si no existe; las credenciales demo se configuran en `backend/.env`. `passwordHash` se calcula con bcrypt y no se devuelve por la API. Cambia el correo y contraseña de demostración si más personas tendrán acceso a la instancia.

## Variables de entorno

| Variable | Servicio | Uso |
| --- | --- | --- |
| `NODE_ENV` | Backend | Entorno (`development` por defecto). |
| `PORT` | Backend | Puerto Express (`4000` por defecto). |
| `MONGODB_URI` | Backend | URI requerido de MongoDB. |
| `JWT_SECRET` | Backend | Secreto JWT requerido, mínimo 32 caracteres. |
| `JWT_EXPIRES_IN` | Backend | Vigencia del token (`8h` por defecto). |
| `CORS_ORIGIN` | Backend | Orígenes frontend permitidos, separados por coma. |
| `SEED_ADMIN_NAME` | Script seed | Nombre para el administrador demo. |
| `SEED_ADMIN_EMAIL` | Script seed | Correo del administrador demo. |
| `SEED_ADMIN_PASSWORD` | Script seed | Contraseña demo (mínimo 12 caracteres). |
| `VITE_API_BASE_URL` | Frontend | Prefijo de API en el navegador (`/api`). |
| `VITE_API_PROXY_TARGET` | Frontend | Backend al que reenvía Vite (`http://localhost:4000`). |
| `TEST_MONGODB_URI` | Pruebas backend | MongoDB separado para las pruebas de integración. |

## API implementada

Todas las respuestas son JSON. Errores de validación usan HTTP 400, credenciales/sesión HTTP 401, permisos HTTP 403, recurso inexistente HTTP 404 y duplicados HTTP 409.

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Público | Estado de la API y conexión MongoDB. Responde 503 si la base no está conectada. |
| `POST` | `/api/auth/login` | Público | Inicio de sesión; responde token y usuario sin hash. |
| `GET` | `/api/auth/me` | JWT | Usuario de la sesión actual. |
| `GET` | `/api/servicios` | Público/JWT | Servicios activos para el público. El rol administrador puede usar `?estado=ACTIVO`, `INACTIVO` o `TODOS`. |
| `GET` | `/api/servicios/:id` | Público/JWT | Consulta un servicio; los inactivos solo son visibles para el administrador. |
| `POST` | `/api/servicios` | Administrador | Crea un servicio. |
| `PUT` | `/api/servicios/:id` | Administrador | Actualiza campos del servicio. |
| `PATCH` | `/api/servicios/:id/estado` | Administrador | Activa/desactiva mediante `{ "isActive": false }`. |

La API no tiene borrado físico de servicios; se pueden desactivar sin romper referencias históricas.

## Modelos y alcance

Los modelos Mongoose iniciales son `User`, `Patient`, `Responsible`, `Professional`, `Service` y `Appointment`. El profesional referencia a un usuario (la identidad y el correo se mantienen en un solo lugar). Las referencias paciente-responsable son muchos a muchos y la edad del paciente se calcula desde su fecha de nacimiento.

Autenticación, roles y catálogo de servicios funcionan en la API. `Patient`, `Responsible`, `Professional` y `Appointment` son esquemas preparados para etapas posteriores; no tienen rutas CRUD ni vistas. No están implementados agenda, calendario, materiales, pagos ni caja. Solicitar una cita y enviar el formulario de contacto tampoco están implementados.

## Pruebas

Backend:

```powershell
cd backend
npm test
```

El conjunto de modelos valida reglas locales sin MongoDB. La prueba HTTP de autenticación/autorización y CRUD usa persistencia MongoDB real y se omite si no se configura una base exclusiva para pruebas:

```powershell
$env:TEST_MONGODB_URI = 'mongodb://127.0.0.1:27017/sigca_test'
npm test
```

No configures `TEST_MONGODB_URI` con una base que contenga información importante: la prueba crea y elimina registros de prueba identificados expresamente.

Frontend:

```powershell
cd frontend
npm run build
```

Para comprobar la integración manualmente, inicia MongoDB, ejecuta `npm run seed`, `npm run dev` en backend y `npm run dev` en frontend. `GET http://localhost:4000/api/health` debe devolver `{"status":"ok","database":"connected"}`. En el portal, el catálogo se carga por `GET /api/servicios?estado=ACTIVO`; si la API no responde, el portal muestra un error y un control para reintentar.

### Resultado de verificación de esta entrega

Comprobaciones ejecutadas el 23 de octubre de 2026:

- Instalación de dependencias de backend y frontend: completada.
- `backend: npm test`: 5 aprobadas, 0 fallidas y 1 omitida (la integración HTTP necesita `TEST_MONGODB_URI`).
- `frontend: npm run build`: completado correctamente con Vite.
- `frontend: npm run dev -- --host 127.0.0.1`: inició y anunció `http://127.0.0.1:5173/`.
- La prueba local del handler de salud confirmó HTTP 503 y estado `disconnected` mientras no hay conexión MongoDB.
- No se pudo probar la conexión real, el arranque de la API contra una base, el seeder, el login HTTP, el CRUD persistido ni la carga del catálogo desde MongoDB: en el entorno no están disponibles `mongod`, `mongosh`, Docker ni una URI MongoDB de desarrollo o pruebas. La prueba de integración se salta en esta condición; no se reporta como aprobada.

## Colaboración

Frontend y backend son paquetes independientes. Cada integrante puede trabajar en una de estas carpetas; los contratos REST, modelos y contenido provisional están documentados aquí. Antes de integrar cambios, coordinen los nombres de campos y no guarden archivos `.env`, `node_modules` ni `frontend/dist` en el repositorio.

## Guion breve para la presentación

1. Mostrar el portal, recorrer el carrusel ilustrado y las secciones de misión, visión y horarios provisionales.
2. Señalar que el catálogo visible llega de MongoDB y mostrar una ficha con duración y precio en quetzales.
3. Abrir el acceso administrativo e ingresar con el administrador ficticio configurado en `.env`.
4. Crear un servicio, editarlo y desactivarlo desde el panel; actualizar el portal y comprobar que el servicio inactivo ya no aparece.
5. Explicar que citas, pacientes, calendario y módulos financieros están reservados para etapas futuras.
