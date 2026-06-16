# Tiquetera Back

Backend NestJS para venta de entradas por capacidad de sector, con PostgreSQL, TypeORM, JWT, roles, WebSockets y transacciones con bloqueo pesimista para evitar overselling.

## Instalacion

```bash
npm install
cp .env.example .env
npm run seed
npm run start:dev
```

Swagger queda disponible en `http://localhost:3000/docs`.

Los endpoints se exponen sin prefijo global, por ejemplo `POST /auth/login`, `GET /events`, `POST /reservations` y `GET /admin/sales`.

## Usuarios seed

- Admin: `admin@tickets.com` / `Admin123*`
- Usuario: `user@tickets.com` / `User123*`

## Concurrencia

Las reservas y compras usan `QueryRunner`, transacciones PostgreSQL y `pessimistic_write`, que TypeORM traduce a `SELECT ... FOR UPDATE`. El stock se descuenta y restaura dentro de la misma transaccion que crea reservas, compras y movimientos de stock.

La suite e2e `test/concurrency.e2e-spec.ts` requiere PostgreSQL accesible con las variables de `.env` y simula 10, 20 y 50 usuarios reservando simultaneamente contra un sector con stock limitado.

## Scripts

```bash
npm run build
npm test
npm run test:e2e
npm run seed
```
