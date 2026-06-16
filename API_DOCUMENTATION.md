**Documentación de API — Endpoints y DTOs**

Este documento contiene un listado de los endpoints disponibles en el backend, los esquemas de los DTOs usados para requests y ejemplos de requests/responses para integrar el frontend.

**Endpoints**
- **Auth — Register:** `POST /auth/register` : Registra un usuario. Body: `RegisterDto` ([src/modules/auth/dto/register.dto.ts](src/modules/auth/dto/register.dto.ts)).
- **Auth — Login:** `POST /auth/login` : Autentica y devuelve `accessToken` y `refreshToken`. Body: `LoginDto` ([src/modules/auth/dto/login.dto.ts](src/modules/auth/dto/login.dto.ts)).
- **Auth — Refresh token:** `POST /auth/refresh` : Renueva tokens usando `refreshToken`. Body: `RefreshTokenDto` ([src/modules/auth/dto/refresh-token.dto.ts](src/modules/auth/dto/refresh-token.dto.ts)).
- **Auth — Logout:** `POST /auth/logout` : Cierra sesión del usuario actual. Requiere Bearer JWT.

- **Events — Listar:** `GET /events` : Lista eventos con sus sectores.
- **Events — Obtener uno:** `GET /events/:id` : Detalles de un evento con sectores.
- **Events — Crear:** `POST /events` : Requiere `ADMIN` + Bearer JWT. Body: `CreateEventDto` ([src/modules/events/dto/create-event.dto.ts](src/modules/events/dto/create-event.dto.ts)).
- **Events — Actualizar:** `PATCH /events/:id` : Requiere `ADMIN`. Body: `UpdateEventDto` ([src/modules/events/dto/update-event.dto.ts](src/modules/events/dto/update-event.dto.ts)).
- **Events — Eliminar:** `DELETE /events/:id` : Requiere `ADMIN`.

- **Users — Perfil:** `GET /users/profile` : Requiere Bearer JWT. Devuelve perfil del usuario.
- **Users — Historial de compras:** `GET /users/purchases` : Requiere Bearer JWT. Lista compras exitosas del usuario.

- **Purchases — Crear compra:** `POST /purchases` : Requiere Bearer JWT. Body: `CreatePurchaseDto` ([src/modules/purchases/dto/create-purchase.dto.ts](src/modules/purchases/dto/create-purchase.dto.ts)).

- **Reservations — Crear reserva:** `POST /reservations` : Requiere Bearer JWT. Body: `CreateReservationDto` ([src/modules/reservations/dto/create-reservation.dto.ts](src/modules/reservations/dto/create-reservation.dto.ts)).
- **Reservations — Mis reservas:** `GET /reservations/my-reservations` : Requiere Bearer JWT.

- **Admin — Actualizar precios por evento:** `PATCH /admin/events/:eventId/prices` : Requiere `ADMIN`. Body: `UpdatePricesDto` ([src/modules/events/dto/update-prices.dto.ts](src/modules/events/dto/update-prices.dto.ts)).
- **Admin — Reporte de ventas:** `GET /admin/sales` : Requiere `ADMIN`.

**WebSocket (Realtime)**
- Conexión: Socket.IO al mismo host del backend (por ejemplo `ws://<HOST>` o `wss://<HOST>` si TLS).
- CORS: habilitado con origen dinámico.
- Evento disponible: `event.subscribe` — Payload: `{ "eventId": number }`. El servidor une al socket a la room `event:{eventId}` y responde `{ event: "event:{eventId}" }`.

---

**Esquemas DTO y ejemplos**

1) `RegisterDto` ([src/modules/auth/dto/register.dto.ts](src/modules/auth/dto/register.dto.ts))
- Campos:
  - `name`: string (ej: "Ada Lovelace")
  - `email`: string (email válido)
  - `password`: string (mínimo 8 caracteres)
- Ejemplo request:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@tickets.com",
  "password": "Strong123*"
}
```
- Ejemplo response (200):

```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<refresh_jwt>",
  "user": { "id": 1, "name": "Ada Lovelace", "email": "ada@tickets.com", "role": "ADMIN" }
}
```

2) `LoginDto` ([src/modules/auth/dto/login.dto.ts](src/modules/auth/dto/login.dto.ts))
- Campos:
  - `email`: string (email)
  - `password`: string
- Ejemplo request:

```json
{
  "email": "ada@tickets.com",
  "password": "Strong123*"
}
```
- Ejemplo response (200): igual que `register` — contiene `accessToken`, `refreshToken` y `user`.

3) `RefreshTokenDto` ([src/modules/auth/dto/refresh-token.dto.ts](src/modules/auth/dto/refresh-token.dto.ts))
- Campos:
  - `refreshToken`: string
- Ejemplo request:

```json
{ "refreshToken": "<refresh_jwt>" }
```
- Ejemplo response (200): nuevo par `accessToken`/`refreshToken` y `user`.

4) `CreateEventDto` ([src/modules/events/dto/create-event.dto.ts](src/modules/events/dto/create-event.dto.ts))
- Campos:
  - `title`: string
  - `description`: string
  - `imageUrl`: string
  - `date`: ISO datetime string
  - `sectors`: array de `CreateEventSectorDto` ([src/modules/events/dto/create-event-sector.dto.ts](src/modules/events/dto/create-event-sector.dto.ts))

`CreateEventSectorDto` campos:
- `sector`: enum `Sector` (ver [src/common/enums/sector.enum.ts](src/common/enums/sector.enum.ts))
- `price`: number (ej: 30000)
- `capacity`: integer

- Ejemplo request:

```json
{
  "title": "Coldplay 2027",
  "description": "Show en estadio",
  "imageUrl": "https://.../img.jpg",
  "date": "2027-10-20T23:00:00.000Z",
  "sectors": [
    { "sector": "GENERAL", "price": 30000, "capacity": 1000 },
    { "sector": "VIP", "price": 80000, "capacity": 200 }
  ]
}
```
- Ejemplo response (201): objeto `Event` con campos: `id`, `title`, `description`, `imageUrl`, `date`, `sectors` (cada sector incluye `id`, `eventId`, `sector`, `price` como string numérica, `capacity`, `availableQuantity`).

Ejemplo response (simplificado):

```json
{
  "id": 42,
  "title": "Coldplay 2027",
  "description": "Show en estadio",
  "imageUrl": "https://.../img.jpg",
  "date": "2027-10-20T23:00:00.000Z",
  "sectors": [
    { "id": 1, "eventId": 42, "sector": "GENERAL", "price": "30000.00", "capacity": 1000, "availableQuantity": 1000 },
    { "id": 2, "eventId": 42, "sector": "VIP", "price": "80000.00", "capacity": 200, "availableQuantity": 200 }
  ]
}
```

5) `UpdateEventDto` ([src/modules/events/dto/update-event.dto.ts](src/modules/events/dto/update-event.dto.ts)) — parcial de `CreateEventDto`.
- Uso: enviar solo los campos a modificar.

6) `UpdatePricesDto` ([src/modules/events/dto/update-prices.dto.ts](src/modules/events/dto/update-prices.dto.ts))
- Campos:
  - `prices`: array de objetos `{ sector: Sector, price: number }`.
- Ejemplo request:

```json
{
  "prices": [ { "sector": "VIP", "price": 45000 }, { "sector": "GENERAL", "price": 35000 } ]
}
```
- Ejemplo response: el `Event` actualizado (igual formato a `CreateEvent` response).

7) `CreateReservationDto` ([src/modules/reservations/dto/create-reservation.dto.ts](src/modules/reservations/dto/create-reservation.dto.ts))
- Campos:
  - `eventSectorId`: integer (id del sector del evento)
  - `quantity`: integer (>=1)
- Ejemplo request:

```json
{ "eventSectorId": 1, "quantity": 2 }
```
- Ejemplo response (201): `Reservation` con campos: `id`, `userId`, `eventSectorId`, `quantity`, `status`, `expiresAt`, `createdAt`.

Ejemplo response:

```json
{
  "id": 11,
  "userId": 3,
  "eventSectorId": 1,
  "quantity": 2,
  "status": "PENDING",
  "expiresAt": "2026-06-12T10:05:00.000Z",
  "createdAt": "2026-06-12T10:00:00.000Z",
  "eventSector": { "id": 1, "eventId": 42, "sector": "GENERAL", "price": "30000.00" , "capacity": 1000, "availableQuantity": 998 }
}
```

8) `CreatePurchaseDto` ([src/modules/purchases/dto/create-purchase.dto.ts](src/modules/purchases/dto/create-purchase.dto.ts))
- Campos:
  - `reservationId`: integer
- Ejemplo request:

```json
{ "reservationId": 11 }
```
- Ejemplo response (201): `Purchase` con campos: `id`, `userId`, `reservationId`, `totalAmount`, `status`, `createdAt`.

Ejemplo response:

```json
{
  "id": 5,
  "userId": 3,
  "reservationId": 11,
  "totalAmount": "60000.00",
  "status": "SUCCESS",
  "createdAt": "2026-06-12T10:01:00.000Z"
}
```

9) Respuestas de Admin `GET /admin/sales` (ejemplo):

```json
{
  "totalSales": 123,
  "totalRevenue": 3450000,
  "ticketsSold": 1200,
  "ticketsAvailable": 8000,
  "salesByEvent": [ { "eventId": 42, "title": "Coldplay 2027", "sales": 50, "revenue": 1500000, "ticketsSold": 50 } ],
  "topEvents": [ { "eventId": 42, "title": "Coldplay 2027", "sales": 50, "revenue": 1500000, "ticketsSold": 50 } ]
}
```

---

Si quieres, puedo:
- generar un archivo `openapi.json`/`swagger` mínimo a partir de estos DTOs,
- añadir ejemplos más detallados por endpoint (headers, códigos de error),
- o crear snippets de llamadas `fetch`/`axios` listos para el frontend.

Archivo generado: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

**Adiciones solicitadas**

- **Payloads exactos de Socket.IO**
  - Evento entrante (cliente -> servidor): `event.subscribe`
    - Payload: `{ "eventId": number }`
    - Respuesta inmediata del gateway: `{ "event": "event:{eventId}" }` (valor literal con `eventId`).

  - Eventos emitidos a la room `event:{eventId}` (servidor -> clientes):
    - `stock.updated`
      - Payload (tipo `StockPayload`):
        ```json
        { "eventId": 42, "sector": "VIP", "availableQuantity": 123 }
        ```
        - Tipos: `eventId: number`, `sector: Sector`, `availableQuantity: number`.

    - `reservation.created`
      - Payload:
        ```json
        { "reservationId": 11, "eventId": 42, "sector": "GENERAL", "availableQuantity": 998 }
        ```
      - Campos: `reservationId: number`, `eventId: number`, `sector: Sector`, `availableQuantity: number`.

    - `reservation.expired`
      - Payload (misma forma que `reservation.created`):
        ```json
        { "reservationId": 11, "eventId": 42, "sector": "GENERAL", "availableQuantity": 1000 }
        ```

    - `purchase.completed`
      - Payload:
        ```json
        { "purchaseId": 5, "reservationId": 11 }
        ```

- **Enum `Sector` completo**
  - Valores disponibles (ver [src/common/enums/sector.enum.ts](src/common/enums/sector.enum.ts)):
    - `VIP`
    - `CAMPO`
    - `PLATEA_A`
    - `PLATEA_B`

- **Formato de errores de la API**
  - Respuesta homogénea (prod. por `AllExceptionsFilter`) siempre con el mismo envoltorio:
    ```json
    {
      "statusCode": 400,
      "path": "/events",
      "timestamp": "2026-06-13T12:34:56.789Z",
      "error": { /* cuerpo del error */ }
    }
    ```
  - `error` puede ser:
    - un `string` (por ejemplo: "Internal server error") para errores genéricos 500,
    - o un `object` (por ejemplo, respuesta de `HttpException` / validación) que contiene detalles del error. Ejemplo típico de validación (`class-validator`):
    ```json
    {
      "statusCode": 400,
      "path": "/auth/register",
      "timestamp": "2026-06-13T12:34:56.789Z",
      "error": {
        "statusCode": 400,
        "message": ["password must be longer than or equal to 8 characters"],
        "error": "Bad Request"
      }
    }
    ```
  - Observaciones:
    - El campo `statusCode` de la envoltura refleja el código HTTP devuelto.
    - Para errores producidos por `HttpException`, el filtro incluye el cuerpo de la excepción en `error` sin modificarlo.

---

He añadido estos detalles para que el frontend implemente sus listeners y manejadores de error de forma consistente.

