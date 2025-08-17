# Expenses Module

The Expenses module handles business expense requests with an approval workflow. Business members can create expense requests that require approval from authorized members.

## Features

- **Expense Creation**: Members can create expense requests with amount, reason, category, and optional details
- **Approval Workflow**: Expenses start in PENDING state and require approval from members with `expenses.approve` permission
- **Status Management**: Expenses can be APPROVED, REJECTED, or CANCELLED
- **Auto-reference Generation**: Each expense gets a unique reference number (e.g., EXP-2024-001)
- **Audit Trail**: Tracks who created, approved, and updated expenses
- **Filtering & Pagination**: List expenses with search, status, and category filters

## Entities

### Expense
- Extends `TenantEntity` for multi-tenancy
- Tracks amount, reason, category, status, and approval workflow
- Links to requester (Member who created) and approver (Member who approved/rejected)
- Supports attachments and metadata for additional information

## API Endpoints

### POST `/api/business/:businessGgId/expenses`
Create a new expense request
- **Permission**: `expenses.create`
- **Body**: `CreateExpenseRequestDto`
- **Response**: `ExpenseResponseDto`

### GET `/api/business/:businessGgId/expenses`
List expenses with pagination and filtering
- **Permission**: `expenses.view`
- **Query Parameters**: `page`, `limit`, `search`, `status`, `category`
- **Response**: `PaginatedResponseDto<ExpenseResponseDto>`

### GET `/api/business/:businessGgId/expenses/:id`
Get a specific expense by ID
- **Permission**: `expenses.view`
- **Response**: `ExpenseResponseDto`

### PUT `/api/business/:businessGgId/expenses/:id/approve`
Approve or reject an expense
- **Permission**: `expenses.approve`
- **Body**: `ApproveExpenseRequestDto`
- **Response**: `ExpenseResponseDto`

### PUT `/api/business/:businessGgId/expenses/:id/cancel`
Cancel an expense request
- **Permission**: `expenses.update`
- **Response**: `ExpenseResponseDto`

## Workflow

1. **Creation**: Member creates expense request → Status: PENDING
2. **Approval**: Authorized member approves/rejects → Status: APPROVED/REJECTED
3. **Cancellation**: Requester or authorized member can cancel → Status: CANCELLED

## Permission Requirements

- `expenses.create` - Create expense requests
- `expenses.view` - View expenses
- `expenses.approve` - Approve/reject expenses
- `expenses.update` - Cancel expenses

## Data Models

### CreateExpenseRequestDto
- `amount` (required): Expense amount in kobo/cents
- `reason` (required): Description of the expense
- `notes` (optional): Additional notes
- `category` (optional): Expense category (defaults to OTHER)
- `dueDate` (optional): When payment is due
- `attachments` (optional): Array of file URLs
- `metadata` (optional): Additional flexible data

### ApproveExpenseRequestDto
- `status` (required): Either 'approved' or 'rejected'
- `rejectionReason` (required if rejected): Reason for rejection
- `notes` (optional): Additional approval notes

### ExpenseResponseDto
- Complete expense information including relationships
- Formatted dates and nested member/user data
- Business context and audit information

## Business Rules

- Only PENDING expenses can be approved/rejected
- Rejection requires a reason
- Cancellation allowed only by requester or members with approval permission
- Reference numbers are auto-generated per business per year
- All amounts stored in kobo/cents for precision
- Default currency is NGN (Nigerian Naira)

## Integration Points

- **Auth Module**: Uses Member entity and permission system
- **Business Module**: Tenant resolution via businessId
- **Common Module**: Base entities, DTOs, and utilities
