import { Migration } from '@mikro-orm/migrations';

export class Migration20250817163245_init extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "permissions" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "key" varchar(100) not null, "name" varchar(100) not null, "description" varchar(255) null, "category" text check ("category" in ('business', 'items', 'inventory', 'orders', 'customers', 'payments', 'expenses', 'reports', 'settings', 'users')) not null default 'business', "is_active" boolean not null default true);`);
    this.addSql(`alter table "permissions" add constraint "permissions_key_unique" unique ("key");`);

    this.addSql(`create table "users" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "first_name" varchar(100) not null, "last_name" varchar(100) not null, "phone" varchar(20) not null, "password" varchar(255) not null, "is_active" boolean not null default true, "phone_verified" boolean not null default false, "last_login_at" timestamptz null, "avatar" varchar(255) null, "preferences" jsonb null);`);
    this.addSql(`alter table "users" add constraint "users_phone_unique" unique ("phone");`);

    this.addSql(`create table "businesses" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "gg_id" varchar(6) not null, "name" varchar(255) not null, "phone" varchar(20) not null, "address" text null, "industry" varchar(100) null, "status" text check ("status" in ('pending', 'active', 'suspended', 'inactive')) not null default 'pending', "logo" text null, "banner" text null, "description" text null, "settings" jsonb null, "approved_at" timestamptz null, "approved_by_id" int null);`);
    this.addSql(`alter table "businesses" add constraint "businesses_phone_unique" unique ("phone");`);
    this.addSql(`alter table "businesses" add constraint "businesses_gg_id_unique" unique ("gg_id");`);

    this.addSql(`create table "roles" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "name" varchar(100) not null, "description" text null, "is_active" boolean not null default true, "is_system" boolean not null default false);`);
    this.addSql(`alter table "roles" add constraint "roles_business_id_name_unique" unique ("business_id", "name");`);

    this.addSql(`create table "permissions_roles" ("permission_id" int not null, "role_id" int not null, constraint "permissions_roles_pkey" primary key ("permission_id", "role_id"));`);

    this.addSql(`create table "notifications" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "template" varchar(255) not null, "receiver_id" int not null, "variables" jsonb not null, "channel" text check ("channel" in ('whatsapp', 'sms')) not null, "send_at" timestamptz not null, "external_id" varchar(255) null, "sent_at" timestamptz null, "status" text check ("status" in ('pending', 'sent', 'delivered', 'read', 'failed')) not null default 'pending', "delivered_at" timestamptz null, "read_at" timestamptz null, "error_message" text null, "retry_count" int not null default 0, "last_retry_at" timestamptz null);`);

    this.addSql(`create table "members" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "created_by_id" int null, "updated_by_id" int null, "user_id" int not null, "business_id" int not null, "position" varchar(100) null, "status" text check ("status" in ('active', 'inactive', 'suspended')) not null default 'active', "is_owner" boolean not null default false, "joined_at" timestamptz null, "left_at" timestamptz null, "settings" jsonb null);`);
    this.addSql(`alter table "members" add constraint "members_business_id_user_id_unique" unique ("business_id", "user_id");`);

    this.addSql(`create table "members_roles" ("member_id" int not null, "role_id" int not null, constraint "members_roles_pkey" primary key ("member_id", "role_id"));`);

    this.addSql(`create table "members_direct_permissions" ("member_id" int not null, "permission_id" int not null, constraint "members_direct_permissions_pkey" primary key ("member_id", "permission_id"));`);

    this.addSql(`create table "items" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "sku" varchar(50) not null, "name" varchar(255) not null, "model_no" varchar(100) null, "description" text null, "category" varchar(100) null, "brand" varchar(100) null, "images" jsonb null, "cost_price" numeric(10,2) not null, "selling_price" numeric(10,2) not null, "discount_price" numeric(10,2) null, "currency" varchar(10) not null default 'NGN', "unit" varchar(20) null, "total_stock" int not null default 0, "reserved_stock" int not null default 0, "minimum_stock" int not null default 0, "status" text check ("status" in ('Active', 'Inactive', 'Discontinued')) not null default 'Active', "track_stock" boolean not null default true, "allow_pre_order" boolean not null default false, "barcode" varchar(100) null);`);
    this.addSql(`alter table "items" add constraint "items_business_id_sku_unique" unique ("business_id", "sku");`);

    this.addSql(`create table "stock_entries" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "item_id" int not null, "type" text check ("type" in ('Incoming', 'Adjustment', 'Return', 'Damage', 'Theft', 'Sale', 'Reservation', 'Release')) not null, "quantity" int not null, "previous_stock" int not null, "new_stock" int not null, "unit_cost" numeric(10,2) null, "reference" varchar(255) null, "notes" text null, "status" text check ("status" in ('Pending', 'Completed', 'Cancelled')) not null default 'Pending', "processed_by_id" int null, "processed_at" timestamptz null, "supplier" varchar(100) null, "expiry_date" timestamptz null, "batch_number" varchar(50) null);`);

    this.addSql(`create table "reservations" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "item_id" int not null, "quantity" int not null, "fulfilled_quantity" int not null default 0, "type" text check ("type" in ('PreOrder', 'Order', 'Internal', 'Promotion')) not null default 'Internal', "status" text check ("status" in ('Active', 'Fulfilled', 'Cancelled', 'Expired')) not null default 'Active', "customer_name" varchar(255) null, "customer_phone" varchar(20) null, "reference" varchar(100) null, "notes" text null, "expected_date" timestamptz null, "expiry_date" timestamptz null, "reserved_by_id" int null, "fulfilled_at" timestamptz null, "fulfilled_by_id" int null);`);

    this.addSql(`create table "item_attributes" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "name" varchar(100) not null, "value" text not null, "data_type" varchar(50) null, "display_order" int null, "is_active" boolean not null default true, "item_id" int not null);`);
    this.addSql(`alter table "item_attributes" add constraint "item_attributes_item_id_name_unique" unique ("item_id", "name");`);

    this.addSql(`create table "expenses" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "amount" numeric(10,2) not null, "currency" varchar(10) not null default 'NGN', "notes" text not null, "category" text check ("category" in ('utilities', 'transportation', 'equipment', 'other')) not null default 'other', "status" text check ("status" in ('pending', 'approved', 'rejected', 'cancelled')) not null default 'pending', "approved_at" timestamptz null, "rejected_at" timestamptz null, "rejection_reason" text null, "requester_id" int not null, "approver_id" int null);`);

    this.addSql(`create table "customers" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "first_name" varchar(255) not null, "last_name" varchar(255) null, "phone" varchar(20) not null, "address" text null, "city" varchar(100) null, "state" varchar(100) null, "postal_code" varchar(20) null, "date_of_birth" date null, "gender" text check ("gender" in ('Male', 'Female', 'Other')) null, "notes" text null, "is_active" boolean not null default true);`);
    this.addSql(`alter table "customers" add constraint "customers_business_id_phone_unique" unique ("business_id", "phone");`);

    this.addSql(`create table "orders" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "updated_by_id" int null, "order_number" varchar(50) not null, "customer_id" int not null, "type" text check ("type" in ('Regular', 'PreOrder', 'Wholesale', 'Retail')) not null default 'Regular', "status" text check ("status" in ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')) not null default 'Pending', "subtotal" numeric(10,2) not null, "tax_amount" numeric(10,2) not null default 0, "discount_amount" numeric(10,2) not null default 0, "shipping_amount" numeric(10,2) not null default 0, "total" numeric(10,2) not null, "currency" varchar(10) not null default 'NGN', "is_pre_order" boolean not null default false, "notes" text null, "delivery_address" varchar(255) null, "expected_delivery_date" timestamptz null, "delivered_at" timestamptz null, "cancelled_at" timestamptz null, "cancelled_by_id" int null, "cancellation_reason" text null, "created_by_id" int not null);`);
    this.addSql(`alter table "orders" add constraint "orders_business_id_order_number_unique" unique ("business_id", "order_number");`);

    this.addSql(`create table "order_items" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "created_by_id" int null, "updated_by_id" int null, "order_id" int not null, "item_id" int not null, "item_sku" varchar(50) not null, "item_name" varchar(255) not null, "quantity" int not null, "unit_price" numeric(10,2) not null, "discount_amount" numeric(10,2) not null default 0, "line_total" numeric(10,2) not null, "currency" varchar(10) not null default 'NGN', "is_pre_order" boolean not null default false, "reserved_quantity" int not null default 0, "fulfilled_quantity" int not null default 0, "notes" text null);`);

    this.addSql(`create table "invoices" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "updated_by_id" int null, "invoice_number" varchar(50) not null, "order_id" int not null, "customer_id" int not null, "type" text check ("type" in ('Standard', 'Proforma', 'CreditNote', 'DebitNote')) not null default 'Standard', "status" text check ("status" in ('Draft', 'Sent', 'Paid', 'PartialPaid', 'Overdue', 'Voided')) not null default 'Draft', "issue_date" date not null, "due_date" date not null, "subtotal" numeric(10,2) not null, "tax_amount" numeric(10,2) not null default 0, "discount_amount" numeric(10,2) not null default 0, "shipping_amount" numeric(10,2) not null default 0, "total" numeric(10,2) not null, "paid_amount" numeric(10,2) not null default 0, "balance_amount" numeric(10,2) not null, "currency" varchar(10) not null default 'NGN', "notes" text null, "terms" text null, "sent_at" timestamptz null, "paid_at" timestamptz null, "voided_at" timestamptz null, "voided_by_id" int null, "void_reason" text null, "created_by_id" int not null);`);
    this.addSql(`alter table "invoices" add constraint "invoices_business_id_invoice_number_unique" unique ("business_id", "invoice_number");`);

    this.addSql(`create table "payment_schedules" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "updated_by_id" int null, "invoice_id" int not null, "installment_number" int not null, "due_date" date not null, "amount_due" numeric(10,2) not null, "amount_paid" numeric(10,2) not null default 0, "currency" varchar(3) not null default 'NGN', "status" text check ("status" in ('Pending', 'Paid', 'Overdue', 'PartialPaid', 'Cancelled')) not null default 'Pending', "notes" text null, "paid_at" timestamptz null, "last_payment_at" timestamptz null, "created_by_id" int not null);`);
    this.addSql(`alter table "payment_schedules" add constraint "payment_schedules_business_id_invoice_id_installm_633e5_unique" unique ("business_id", "invoice_id", "installment_number");`);

    this.addSql(`create table "payments" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "business_id" int not null, "updated_by_id" int null, "payment_number" varchar(50) not null, "invoice_id" int not null, "customer_id" int not null, "amount" numeric(10,2) not null, "currency" varchar(10) not null default 'NGN', "method" text check ("method" in ('Cash', 'BankTransfer')) not null, "type" text check ("type" in ('OneTime', 'Installment')) not null default 'OneTime', "status" text check ("status" in ('Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Refunded')) not null default 'Pending', "external_reference" varchar(100) null, "provider_transaction_id" varchar(100) null, "provider" varchar(50) null, "provider_response" text null, "bank_name" varchar(100) null, "account_number" varchar(20) null, "account_name" varchar(100) null, "bank_details_expiry_date" timestamptz null, "reference" varchar(100) null, "notes" text null, "paid_at" timestamptz null, "failed_at" timestamptz null, "failure_reason" text null, "refunded_at" timestamptz null, "refunded_amount" numeric(10,2) not null default 0, "refunded_by_id" int null, "refund_reason" text null, "created_by_id" int not null);`);
    this.addSql(`alter table "payments" add constraint "payments_business_id_external_reference_unique" unique ("business_id", "external_reference");`);
    this.addSql(`alter table "payments" add constraint "payments_business_id_payment_number_unique" unique ("business_id", "payment_number");`);

    this.addSql(`create table "auth_otp" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "otp_code" varchar(6) not null, "phone" varchar(20) not null, "business_id" int not null, "user_id" int null, "is_used" boolean not null default false, "is_expired" boolean not null default false, "expires_at" timestamptz not null, "attempts" int not null default 0, "max_attempts" int not null default 3);`);
    this.addSql(`create index "auth_otp_otp_code_phone_business_id_index" on "auth_otp" ("otp_code", "phone", "business_id");`);
    this.addSql(`create index "auth_otp_phone_business_id_is_used_index" on "auth_otp" ("phone", "business_id", "is_used");`);

    this.addSql(`alter table "businesses" add constraint "businesses_approved_by_id_foreign" foreign key ("approved_by_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "roles" add constraint "roles_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "roles" add constraint "roles_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "roles" add constraint "roles_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "permissions_roles" add constraint "permissions_roles_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "permissions_roles" add constraint "permissions_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "notifications" add constraint "notifications_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "notifications" add constraint "notifications_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "notifications" add constraint "notifications_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "notifications" add constraint "notifications_receiver_id_foreign" foreign key ("receiver_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "members" add constraint "members_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "members" add constraint "members_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "members" add constraint "members_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade;`);
    this.addSql(`alter table "members" add constraint "members_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);

    this.addSql(`alter table "members_roles" add constraint "members_roles_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "members_roles" add constraint "members_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "members_direct_permissions" add constraint "members_direct_permissions_member_id_foreign" foreign key ("member_id") references "members" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "members_direct_permissions" add constraint "members_direct_permissions_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "items" add constraint "items_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "items" add constraint "items_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "items" add constraint "items_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "stock_entries" add constraint "stock_entries_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "stock_entries" add constraint "stock_entries_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "stock_entries" add constraint "stock_entries_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "stock_entries" add constraint "stock_entries_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade;`);
    this.addSql(`alter table "stock_entries" add constraint "stock_entries_processed_by_id_foreign" foreign key ("processed_by_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "reservations" add constraint "reservations_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "reservations" add constraint "reservations_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "reservations" add constraint "reservations_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "reservations" add constraint "reservations_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade;`);
    this.addSql(`alter table "reservations" add constraint "reservations_reserved_by_id_foreign" foreign key ("reserved_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "reservations" add constraint "reservations_fulfilled_by_id_foreign" foreign key ("fulfilled_by_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "item_attributes" add constraint "item_attributes_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "item_attributes" add constraint "item_attributes_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "item_attributes" add constraint "item_attributes_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "item_attributes" add constraint "item_attributes_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade;`);

    this.addSql(`alter table "expenses" add constraint "expenses_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "expenses" add constraint "expenses_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "expenses" add constraint "expenses_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "expenses" add constraint "expenses_requester_id_foreign" foreign key ("requester_id") references "members" ("id") on update cascade;`);
    this.addSql(`alter table "expenses" add constraint "expenses_approver_id_foreign" foreign key ("approver_id") references "members" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "customers" add constraint "customers_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "customers" add constraint "customers_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "customers" add constraint "customers_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "orders" add constraint "orders_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "orders" add constraint "orders_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "orders" add constraint "orders_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade;`);
    this.addSql(`alter table "orders" add constraint "orders_cancelled_by_id_foreign" foreign key ("cancelled_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "orders" add constraint "orders_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "order_items" add constraint "order_items_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "order_items" add constraint "order_items_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "order_items" add constraint "order_items_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "order_items" add constraint "order_items_order_id_foreign" foreign key ("order_id") references "orders" ("id") on update cascade;`);
    this.addSql(`alter table "order_items" add constraint "order_items_item_id_foreign" foreign key ("item_id") references "items" ("id") on update cascade;`);

    this.addSql(`alter table "invoices" add constraint "invoices_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "invoices" add constraint "invoices_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "invoices" add constraint "invoices_order_id_foreign" foreign key ("order_id") references "orders" ("id") on update cascade;`);
    this.addSql(`alter table "invoices" add constraint "invoices_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade;`);
    this.addSql(`alter table "invoices" add constraint "invoices_voided_by_id_foreign" foreign key ("voided_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "invoices" add constraint "invoices_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "payment_schedules" add constraint "payment_schedules_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "payment_schedules" add constraint "payment_schedules_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "payment_schedules" add constraint "payment_schedules_invoice_id_foreign" foreign key ("invoice_id") references "invoices" ("id") on update cascade;`);
    this.addSql(`alter table "payment_schedules" add constraint "payment_schedules_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "payments" add constraint "payments_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "payments" add constraint "payments_updated_by_id_foreign" foreign key ("updated_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "payments" add constraint "payments_invoice_id_foreign" foreign key ("invoice_id") references "invoices" ("id") on update cascade;`);
    this.addSql(`alter table "payments" add constraint "payments_customer_id_foreign" foreign key ("customer_id") references "customers" ("id") on update cascade;`);
    this.addSql(`alter table "payments" add constraint "payments_refunded_by_id_foreign" foreign key ("refunded_by_id") references "users" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "payments" add constraint "payments_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "auth_otp" add constraint "auth_otp_business_id_foreign" foreign key ("business_id") references "businesses" ("id") on update cascade;`);
    this.addSql(`alter table "auth_otp" add constraint "auth_otp_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "permissions_roles" drop constraint "permissions_roles_permission_id_foreign";`);

    this.addSql(`alter table "members_direct_permissions" drop constraint "members_direct_permissions_permission_id_foreign";`);

    this.addSql(`alter table "businesses" drop constraint "businesses_approved_by_id_foreign";`);

    this.addSql(`alter table "roles" drop constraint "roles_created_by_id_foreign";`);

    this.addSql(`alter table "roles" drop constraint "roles_updated_by_id_foreign";`);

    this.addSql(`alter table "notifications" drop constraint "notifications_created_by_id_foreign";`);

    this.addSql(`alter table "notifications" drop constraint "notifications_updated_by_id_foreign";`);

    this.addSql(`alter table "notifications" drop constraint "notifications_receiver_id_foreign";`);

    this.addSql(`alter table "members" drop constraint "members_created_by_id_foreign";`);

    this.addSql(`alter table "members" drop constraint "members_updated_by_id_foreign";`);

    this.addSql(`alter table "members" drop constraint "members_user_id_foreign";`);

    this.addSql(`alter table "items" drop constraint "items_created_by_id_foreign";`);

    this.addSql(`alter table "items" drop constraint "items_updated_by_id_foreign";`);

    this.addSql(`alter table "stock_entries" drop constraint "stock_entries_created_by_id_foreign";`);

    this.addSql(`alter table "stock_entries" drop constraint "stock_entries_updated_by_id_foreign";`);

    this.addSql(`alter table "stock_entries" drop constraint "stock_entries_processed_by_id_foreign";`);

    this.addSql(`alter table "reservations" drop constraint "reservations_created_by_id_foreign";`);

    this.addSql(`alter table "reservations" drop constraint "reservations_updated_by_id_foreign";`);

    this.addSql(`alter table "reservations" drop constraint "reservations_reserved_by_id_foreign";`);

    this.addSql(`alter table "reservations" drop constraint "reservations_fulfilled_by_id_foreign";`);

    this.addSql(`alter table "item_attributes" drop constraint "item_attributes_created_by_id_foreign";`);

    this.addSql(`alter table "item_attributes" drop constraint "item_attributes_updated_by_id_foreign";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_created_by_id_foreign";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_updated_by_id_foreign";`);

    this.addSql(`alter table "customers" drop constraint "customers_created_by_id_foreign";`);

    this.addSql(`alter table "customers" drop constraint "customers_updated_by_id_foreign";`);

    this.addSql(`alter table "orders" drop constraint "orders_updated_by_id_foreign";`);

    this.addSql(`alter table "orders" drop constraint "orders_cancelled_by_id_foreign";`);

    this.addSql(`alter table "orders" drop constraint "orders_created_by_id_foreign";`);

    this.addSql(`alter table "order_items" drop constraint "order_items_created_by_id_foreign";`);

    this.addSql(`alter table "order_items" drop constraint "order_items_updated_by_id_foreign";`);

    this.addSql(`alter table "invoices" drop constraint "invoices_updated_by_id_foreign";`);

    this.addSql(`alter table "invoices" drop constraint "invoices_voided_by_id_foreign";`);

    this.addSql(`alter table "invoices" drop constraint "invoices_created_by_id_foreign";`);

    this.addSql(`alter table "payment_schedules" drop constraint "payment_schedules_updated_by_id_foreign";`);

    this.addSql(`alter table "payment_schedules" drop constraint "payment_schedules_created_by_id_foreign";`);

    this.addSql(`alter table "payments" drop constraint "payments_updated_by_id_foreign";`);

    this.addSql(`alter table "payments" drop constraint "payments_refunded_by_id_foreign";`);

    this.addSql(`alter table "payments" drop constraint "payments_created_by_id_foreign";`);

    this.addSql(`alter table "auth_otp" drop constraint "auth_otp_user_id_foreign";`);

    this.addSql(`alter table "roles" drop constraint "roles_business_id_foreign";`);

    this.addSql(`alter table "notifications" drop constraint "notifications_business_id_foreign";`);

    this.addSql(`alter table "members" drop constraint "members_business_id_foreign";`);

    this.addSql(`alter table "items" drop constraint "items_business_id_foreign";`);

    this.addSql(`alter table "stock_entries" drop constraint "stock_entries_business_id_foreign";`);

    this.addSql(`alter table "reservations" drop constraint "reservations_business_id_foreign";`);

    this.addSql(`alter table "item_attributes" drop constraint "item_attributes_business_id_foreign";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_business_id_foreign";`);

    this.addSql(`alter table "customers" drop constraint "customers_business_id_foreign";`);

    this.addSql(`alter table "orders" drop constraint "orders_business_id_foreign";`);

    this.addSql(`alter table "order_items" drop constraint "order_items_business_id_foreign";`);

    this.addSql(`alter table "invoices" drop constraint "invoices_business_id_foreign";`);

    this.addSql(`alter table "payment_schedules" drop constraint "payment_schedules_business_id_foreign";`);

    this.addSql(`alter table "payments" drop constraint "payments_business_id_foreign";`);

    this.addSql(`alter table "auth_otp" drop constraint "auth_otp_business_id_foreign";`);

    this.addSql(`alter table "permissions_roles" drop constraint "permissions_roles_role_id_foreign";`);

    this.addSql(`alter table "members_roles" drop constraint "members_roles_role_id_foreign";`);

    this.addSql(`alter table "members_roles" drop constraint "members_roles_member_id_foreign";`);

    this.addSql(`alter table "members_direct_permissions" drop constraint "members_direct_permissions_member_id_foreign";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_requester_id_foreign";`);

    this.addSql(`alter table "expenses" drop constraint "expenses_approver_id_foreign";`);

    this.addSql(`alter table "stock_entries" drop constraint "stock_entries_item_id_foreign";`);

    this.addSql(`alter table "reservations" drop constraint "reservations_item_id_foreign";`);

    this.addSql(`alter table "item_attributes" drop constraint "item_attributes_item_id_foreign";`);

    this.addSql(`alter table "order_items" drop constraint "order_items_item_id_foreign";`);

    this.addSql(`alter table "orders" drop constraint "orders_customer_id_foreign";`);

    this.addSql(`alter table "invoices" drop constraint "invoices_customer_id_foreign";`);

    this.addSql(`alter table "payments" drop constraint "payments_customer_id_foreign";`);

    this.addSql(`alter table "order_items" drop constraint "order_items_order_id_foreign";`);

    this.addSql(`alter table "invoices" drop constraint "invoices_order_id_foreign";`);

    this.addSql(`alter table "payment_schedules" drop constraint "payment_schedules_invoice_id_foreign";`);

    this.addSql(`alter table "payments" drop constraint "payments_invoice_id_foreign";`);

    this.addSql(`drop table if exists "permissions" cascade;`);

    this.addSql(`drop table if exists "users" cascade;`);

    this.addSql(`drop table if exists "businesses" cascade;`);

    this.addSql(`drop table if exists "roles" cascade;`);

    this.addSql(`drop table if exists "permissions_roles" cascade;`);

    this.addSql(`drop table if exists "notifications" cascade;`);

    this.addSql(`drop table if exists "members" cascade;`);

    this.addSql(`drop table if exists "members_roles" cascade;`);

    this.addSql(`drop table if exists "members_direct_permissions" cascade;`);

    this.addSql(`drop table if exists "items" cascade;`);

    this.addSql(`drop table if exists "stock_entries" cascade;`);

    this.addSql(`drop table if exists "reservations" cascade;`);

    this.addSql(`drop table if exists "item_attributes" cascade;`);

    this.addSql(`drop table if exists "expenses" cascade;`);

    this.addSql(`drop table if exists "customers" cascade;`);

    this.addSql(`drop table if exists "orders" cascade;`);

    this.addSql(`drop table if exists "order_items" cascade;`);

    this.addSql(`drop table if exists "invoices" cascade;`);

    this.addSql(`drop table if exists "payment_schedules" cascade;`);

    this.addSql(`drop table if exists "payments" cascade;`);

    this.addSql(`drop table if exists "auth_otp" cascade;`);
  }

}
