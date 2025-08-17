# Multi-tenant EPOS Backend — NestJS + MikroORM

This canvas contains the structured spec, domain model, API surface, tenancy & RBAC design, and a prioritized task board for building the EPOS backend described in the chat. The implementation will follow the folder structure outlined in `FOLDER_STRUCTURE.md` to ensure maintainability, scalability, and consistency.

---

## 1) Project Summary

* Multi-tenant EPOS where each **Business** is a tenant (identified by `businessGgId` auto-gen(6 uppercase alpha-numeric)).
* Tech stack: **NestJS**, **TypeScript**, **MikroORM**, **PostgreSQL**.
* JWT auth, payment adapters (Paystack, Flutterwave), notifier adapters (WhatsApp, SMS), S3-compatible file storage.
* Folder structure: strictly follow `FOLDER_STRUCTURE.md` — each feature module has controllers, services, entities, repositories, models (DTOs), enums, exceptions, guards, strategies, decorators, factories, and optional README.md.
* Migrations are created using the `npm run migration:create --name=<migration-name>` command
* Request/response DTOs naming convention: `*.request.dto.ts` and `*.response.dto.ts`.
* A `todo.md` will track changes and pending tasks.

---

## 2) Tenancy

* Shared DB with `businessId` column on tenant-scoped entities.
* Middleware/Guard resolves `businessGgId` from route `/api/business/:businessGgId/**` and injects `TenantContext`.
* Tenant validation: business exists and `status === 'Active'`.

---

## 3) Auth & RBAC (high level)

* Entities: `User`, `Business`, `Member`, `Role`, `Permission`, `RolePermission`, `MemberRole`.
* Owner created at registration.
* Permission keys example: `items.create`, `items.update`, `orders.create`, `orders.manage`, `expenses.approve`.
* Guards: `TenantResolveGuard`, `PermissionsGuard`, `OwnerOnlyGuard`.

---

## 4) Core Entities (short)

* Business, User, Member, Role, Permission
* Item (sku, name, modelNo, images, attributes JSON, totalStock)
* StockEntry (incoming/adjustment/return)
* Reservation / PreSale
* Customer
* Order (items\[], totals, isPreOrder flag)
* Invoice, Payment, PaymentPlan, Installment
* Expense
* Notification, AuditLog

---

## 5) Inventory & Pre-sales Rules (summary)

* Pre-order (reservation) reduces available-for-sale but not physical `totalStock` until stock arrival.
* On StockEntry: transactional allocation to oldest reservations first.
* Use DB locking / transactional retries to avoid oversell.

---

## 6) Payments & Notifications

* Adapter interfaces for Payment Providers & Notifiers.
* Webhook endpoints per provider: idempotent handling via stored `externalId`.
* Notifications triggered by events: order placed, installment due, low stock, OTP.

---

## 7) API Surface (examples)

* `POST /api/business/register` — register business + owner (Pending approval)
* `POST /api/business/:businessGgId/login` — member login
* `GET /api/business/:businessGgId/profile`
* `POST /api/business/:businessGgId/items` — create item (auto SKU)
* `POST /api/business/:businessGgId/items/:itemId/stock` — add stock
* `POST /api/business/:businessGgId/orders` — create order (in-stock or pre-order)
* `POST /api/business/:businessGgId/orders/:orderId/invoice` — create invoice
* `POST /api/business/:businessGgId/payments/webhook/:provider` — provider webhook
* `POST /api/business/:businessGgId/expenses` — create expense

---

## 8) MikroORM & DB Notes

* Use base `TenantEntity` with `businessId`, `createdAt`, `updatedAt`, `createdBy`.
* Composite indices for `(businessId, sku)` and `(businessId, externalRef)`.
* Use migrations via MikroORM CLI.

---

## 9) Testing & CI

* Unit tests for services (inventory allocation, payments reconciliation).
* Integration tests with Postgres test DB.
* E2E flows: order → invoice → payment webhook → reconciliation.

---

## 10) Prioritized Task Board (pick one to start)

1. **Scaffold project & infra** — NestJS app, MikroORM config, Dockerfile, `.env.example`.
2. **Tenant resolve & auth** — `TenantResolveGuard`, basic `Business` + `User` + `Member` entities, registration flow.
3. **Items & StockEntry** — Item entity, create item endpoint (sku auto-gen using major properties), StockEntry creation + transaction for reservation fulfillment.
4. **Orders & Invoices** — order creation (in-stock vs pre-order), invoice generation, invoice model.
5. **Payment adapter & webhook** — abstract provider interface + Paystack adapter stub + webhook handler.
6. **Notifications** — notifier interface + WhatsApp/SMS stub; event hooks for order confirmation.

---

## 11) What I can generate next (choose one)

* Generate MikroORM entity files + sample migrations for selected modules.
* Generate NestJS module/controller/service/DTO skeletons for chosen modules.
* Create OpenAPI (Swagger) endpoints and DTOs for the main flows.
* Convert the prioritized tasks into a `todo.md` file for tracking changes and tasks to be done (can also be mirrored to GitHub issues if desired).

---

## 12) Notes & Assumptions

* Customers may be created on-the-fly at order time (via phone/name). Unique customer dedup by phone.
* Image storage goes to S3-compatible storage; store URLs in `Item.images` JSON.
* Payment providers must support creating invoice/account numbers.
* SMS fallback when WhatsApp is unavailable.

---

*Reply in the canvas with which next artifact you want generated (entities, controllers, OpenAPI, or GH issues), or pick a task number from the Prioritized Task Board.*
