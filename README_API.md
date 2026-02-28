# Tickets API – Manual del Sistema Completo

Este documento sirve como manual integral para el sistema **Tickets API**. Contiene información tanto para desarrolladores (Manual Técnico y Guía de Integración API) como para administradores del negocio (Manual de Usuario).

> **Swagger UI interactivo disponible en:** `http://localhost:3000/api`

---

# Parte 1: Manual Técnico y de Instalación

## Arquitectura y Stack Tecnológico
El backend está construido bajo el paradigma de la **Clean Architecture** (Arquitectura Limpia), separando responsabilidades en distintas capas: Domain, Application e Infrastructure. Esto garantiza un código altamente mantenible y testeable.

- **Framework:** NestJS (Node.js)
- **Lenguaje:** TypeScript
- **Base de Datos:** MySQL
- **ORM:** TypeORM
- **Autenticación:** JWT (JSON Web Tokens) y Passport
- **Encriptación:** bcrypt (Hasheo de contraseñas)
- **Documentación API:** Swagger / OpenAPI

## Pre-requisitos
- Node.js (v18 o superior)
- MySQL Server en ejecución (local o remoto)
- Git

## Instalación y Arranque Local

1. **Clonar y preparar entorno:**
   ```bash
   npm install
   cp .env.example .env
   ```

2. **Configurar el archivo `.env`:**
   Edite el `.env` con los datos de su base de datos local:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=secret
   DB_NAME=ticketsdb
   JWT_SECRET=una_clave_secreta_fuerte
   PORT=3000
   ADMIN_DEFAULT_PASSWORD=password
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run start:dev
   ```
   *Nota:* TypeORM está configurado con `synchronize: true` en desarrollo, por lo que creará las tablas automáticamente. Al levantar el servidor también se ejecutará un *seeder* que creará el usuario administrador por defecto si no existe.

---

# Parte 2: Manual de Usuario (Reglas de Negocio)

Este sistema permite gestionar "Tickets" o Tareas dentro de una organización, manejando distintos niveles de acceso.

## Roles del Sistema

Existen dos tipos de usuarios en el sistema:

1. **Administrador (`admin`):** 
   - Control total sobre el sistema.
   - Es el único que puede invitar/crear a otros usuarios.
   - Puede editar todos los campos de una tarea (título, prioridad, reasignar, etc.) **mientras la tarea no haya iniciado**.
   - Puede eliminar permanentemente un ticket del sistema.
   
2. **Usuario Regular (`user`):**
   - No puede invitar a otras personas.
   - Puede crear tickets cuando necesita que el equipo solucione algo.
   - Puede ver la lista de tickets que necesitan atención.
   - Puede **"Reclamar"** un ticket para indicar que él se encargará de resolverlo.
   - Una vez resuelto, puede **"Cerrarlo"**.

## Ciclo de Vida de un Ticket (Estados)

El sistema maneja reglas estrictas para evitar modificaciones indeseadas mientras se trabaja:

1. **Pendiente (`pending`):** El ticket fue creado y nadie se ha hecho cargo aún. 
   - *¿Quién puede editarlo?* Solo el Administrador.
2. **En Progreso (`in_progress`):** Un usuario reclamó el ticket y está trabajando en él.
   - *¿Quién puede editarlo?* Nadie. Se bloquea para evitar que le cambien las condiciones mientras alguien trabaja.
3. **Completado (`completed`):** El responsable del ticket terminó el trabajo.
   - *¿Quién puede editarlo?* Nadie. Queda como registro histórico.
4. **Cancelado (`cancelled`):** El ticket ya no es necesario (fue un error o se resolvió de otra forma).
   - *¿Quién puede cancelarlo?* Cualquiera, siempre y cuando no haya sido ya completado.

### Flujo Visual del Negocio
```
 ┌───────────┐     Reclama un usuario      ┌─────────────┐     Usuario lo da por   ┌────────────┐
 │  Creado   │ ──────────────────────────▶ │ Trabajando  │ ──────────────────────▶ │ Completado │
 │ (pending) │                             │(in_progress)│     terminado (close)   │(completed) │
 └───────────┘                             └─────────────┘                         └────────────┘
       │                                          │
       │   Alguien decide cancelarlo (cancel)     │      Alguien decide cancelarlo (cancel)
       └────────────────────────┐                 └──────────────┐
                                ▼                                ▼
                          ┌────────────┐                   ┌────────────┐
                          │ Cancelado  │                   │ Cancelado  │
                          │(cancelled) │                   │(cancelled) │
                          └────────────┘                   └────────────┘
```

---

# Parte 3: Guía de Integración API (Frontend)

## Autenticación

Todas las peticiones a los endpoints protegidos requieren enviar el Token JWT en la cabecera HTTP:
```http
Authorization: Bearer <TU_ACCESS_TOKEN>
```

### Iniciar Sesión `POST /auth/login`
**Body:**
```json
{
  "username": "[USERNAME]",
  "password": "[PASSWORD]"
}
```
**Respuesta (201):** Devuelve el `accessToken` y la información completa del `user` (id, rol, nombres). Guárdalos en tu manejador de estado (Zustand, Redux, Context).

---

## 1. Integración General y Salud

### `GET /health` — Health Check
Este endpoint **NO** requiere autenticación. Su propósito es para asegurar que el backend está corriendo.
- **Respuesta (200):** `{"status": "ok", "timestamp": "..."}`

---

## 2. Módulo de Usuarios

### `GET /users` — Listar Usuarios
Devuelve el listado de todos los empleados/usuarios del sistema.

### `GET /users/:id` — Obtener Usuario
Detalles específicos de un empleado.

### `POST /users` — Invitar/Crear Usuario *(Admin Only)*
**Body:**
```json
{
  "username": "jcaro",
  "name": "Juan",
  "lastName": "Caro",
  "password": "Password123",
  "role": "user"    // Opcional, por defecto es "user"
}
```

---

## 3. Módulo de Tareas (Tickets)

### `GET /tasks` — Tablero de Tickets
Muestra todas las tareas. Soporta filtrado por estado en la URL.
- Ejemplo: `GET /tasks?status=pending` (Para ver lo que falta hacer).
- Ejemplo: `GET /tasks?status=in_progress` (Para ver en qué está ocupado el equipo).

### `POST /tasks` — Crear Ticket
El `ownerId` es **opcional**. Si se envía `null` o no se envía, se crea como pendiente sin asignar.
```json
{
  "title": "Configurar DNS",
  "description": "Se necesita apuntar el dominio al nuevo servidor",
  "priority": "high",
  "createdById": 1
}
```

### `PUT /tasks/:id` — Editar Ticket *(Admin Only)*
Permite cambiar cualquier campo, **pero solo si la tarea está en `pending`**. Si está en otro estado, devolverá error `403`.

### `DELETE /tasks/:id` — Eliminar Ticket *(Admin Only)*
Oculta un ticket de la base de datos (Soft Delete). Devuelve status 204.

---

## 4. Acciones de Flujo (PATCH)

Estas rutar son accesos directos de negocio, no envían Body. 
El backend determina qué usuario hizo la petición basándose en el JWT.

### `PATCH /tasks/:id/claim` — Reclamar Tarea
Toma la tarea, le asigna al usuario actual como dueño (`ownerId`) y la pasa a estado `in_progress`.
- **Respuesta (200):** Tarea actualizada.

### `PATCH /tasks/:id/close` — Cerrar Tarea
Marca la tarea como `completed`. 
- **Restricción vital:** Si el usuario logueado NO es el dueño de esta tarea, la API responderá con un error `403 Forbidden`.

### `PATCH /tasks/:id/cancel` — Cancelar Tarea
Pasa la tarea a estado `cancelled`. 
- **Restricción vital:** No puedes cancelar una tarea que ya figura como `completed`. Fallará con error `403`.

---

## Códigos de Error Globales

| HTTP | Significado para el Frontend |
|---|---|
| `200/201/204` | Exito. Notificar al usuario ("Tarea creada", "Sesión iniciada"). |
| `400` | Error de campos (Bad Request). Ej: olvidaste poner el título al ticket. |
| `401` | Sesión caducada o clave incorrecta. El frontend debe redirigir al `/login`. |
| `403` | Prohibido. El usuario intentó algo que su rol o el sistema no permite (Ej: editar cuando está cerrado, o crear un usuario siendo empleado normal). Mostrar toast de error. |
| `404` | Registro no encontrado (Ej: Tarea eliminada). |
| `500` | El backend falló. Notificar "Error de servidor". |
