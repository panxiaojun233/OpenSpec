## ADDED Requirements

### Requirement: Payment Intent Creation
The system SHALL create Stripe Payment Intents for processing customer payments.

#### Scenario: Successful payment intent creation
- **WHEN** a customer initiates a payment with valid amount and currency
- **THEN** a Stripe Payment Intent is created
- **AND** an order record is created with status "pending"
- **AND** the Payment Intent client secret is returned to the frontend

#### Scenario: Invalid payment amount
- **WHEN** a payment amount is less than minimum ($0.50) or exceeds maximum ($999,999)
- **THEN** payment intent creation fails
- **AND** an error is returned with validation message

#### Scenario: Unsupported currency
- **WHEN** a payment is requested with unsupported currency
- **THEN** payment intent creation fails
- **AND** list of supported currencies is returned

### Requirement: Webhook Event Processing
The system SHALL process Stripe webhook events to update order status asynchronously.

#### Scenario: Payment succeeded webhook
- **WHEN** Stripe sends "payment_intent.succeeded" webhook
- **THEN** webhook signature is verified
- **AND** order status is updated to "completed"
- **AND** transaction record is created with type "charge"

#### Scenario: Payment failed webhook
- **WHEN** Stripe sends "payment_intent.payment_failed" webhook
- **THEN** order status is updated to "failed"
- **AND** failure reason is logged in transaction metadata

#### Scenario: Duplicate webhook delivery
- **WHEN** Stripe retries the same webhook event
- **THEN** idempotency key prevents duplicate processing
- **AND** HTTP 200 is returned without state change

#### Scenario: Invalid webhook signature
- **WHEN** webhook signature verification fails
- **THEN** request is rejected with HTTP 401
- **AND** security alert is logged

### Requirement: Order Lifecycle Management
The system SHALL manage order states through a defined state machine.

#### Scenario: Order state transition
- **WHEN** order progresses from "pending" to "processing"
- **THEN** state transition is allowed
- **AND** transition timestamp is recorded

#### Scenario: Invalid state transition
- **WHEN** attempt to transition from "completed" to "pending"
- **THEN** state change is rejected
- **AND** error indicates invalid transition

#### Scenario: Concurrent order updates
- **WHEN** two webhooks attempt to update the same order simultaneously
- **THEN** optimistic locking prevents lost updates
- **AND** second update retries with fresh data

### Requirement: Refund Processing
The system SHALL support full and partial refunds for completed orders.

#### Scenario: Full refund
- **WHEN** refund is requested for completed order with full amount
- **THEN** Stripe refund is created
- **AND** order status is updated to "refunded"
- **AND** transaction record is created with type "refund"

#### Scenario: Partial refund
- **WHEN** refund is requested with amount less than order total
- **THEN** Stripe partial refund is created
- **AND** transaction record reflects partial amount
- **AND** order status remains "completed"

#### Scenario: Refund on non-completed order
- **WHEN** refund is requested for order in "pending" or "failed" status
- **THEN** refund is rejected
- **AND** error indicates order must be completed

### Requirement: Payment Method Management
The system SHALL support secure storage and management of customer payment methods.

#### Scenario: Save payment method
- **WHEN** customer saves a payment method
- **THEN** Stripe Payment Method is created and attached to customer
- **AND** tokenized reference is stored (no full card number)
- **AND** last 4 digits, brand, and expiry are stored for display

#### Scenario: Set default payment method
- **WHEN** customer sets a payment method as default
- **THEN** previous default is unset
- **AND** new default is marked with is_default = true

#### Scenario: Remove payment method
- **WHEN** customer removes a payment method
- **THEN** Stripe Payment Method is detached
- **AND** local record is soft-deleted
- **AND** if default, no default is set until customer chooses one

### Requirement: Transaction History
The system SHALL provide complete transaction history with audit logging.

#### Scenario: Retrieve transaction history
- **WHEN** user requests transaction history
- **THEN** all transactions (charges, refunds) are returned
- **AND** transactions include order details, amounts, timestamps
- **AND** results are paginated (50 per page)

#### Scenario: Transaction audit log
- **WHEN** any payment operation occurs (charge, refund, dispute)
- **THEN** audit log entry is created with user_id, action, timestamp
- **AND** metadata includes IP address and user agent

#### Scenario: Reconciliation report
- **WHEN** finance team requests reconciliation report for date range
- **THEN** all transactions are grouped by status
- **AND** totals are calculated per currency
- **AND** mismatches with Stripe are flagged

### Requirement: Payment Security
The system SHALL implement PCI DSS Level 1 compliant security controls.

#### Scenario: Secure API key storage
- **WHEN** Stripe API keys are required
- **THEN** keys are fetched from secrets manager (not environment variables)
- **AND** keys are never logged or exposed in responses

#### Scenario: TLS enforcement
- **WHEN** payment API is called
- **THEN** connection uses TLS 1.3 minimum
- **AND** non-TLS requests are rejected

#### Scenario: Rate limiting
- **WHEN** user makes payment requests
- **THEN** maximum 100 requests per minute is enforced
- **AND** excessive requests return HTTP 429

#### Scenario: Failed payment attempt limit
- **WHEN** user has 5 failed payment attempts within 1 hour
- **THEN** further attempts are blocked for 1 hour
- **AND** security team is notified

### Requirement: Fraud Detection
The system SHALL integrate Stripe Radar for fraud prevention.

#### Scenario: High-risk transaction
- **WHEN** Stripe Radar flags transaction as high risk
- **THEN** 3D Secure authentication is required
- **AND** customer is redirected to authentication flow

#### Scenario: Blocked transaction
- **WHEN** Stripe Radar blocks transaction (fraud score > threshold)
- **THEN** payment is declined
- **AND** order status is set to "failed" with fraud reason

### Requirement: Performance
The system SHALL process payments with acceptable latency.

#### Scenario: Payment processing latency
- **WHEN** payment intent is created
- **THEN** API response time is < 3 seconds (p95)
- **AND** webhook processing completes within 5 seconds

#### Scenario: Concurrent payment handling
- **WHEN** 1000 concurrent payment requests are received
- **THEN** all requests are processed successfully
- **AND** no database deadlocks occur
- **AND** queue handles webhook backlog

### Requirement: Error Handling
The system SHALL handle payment failures gracefully with retry logic.

#### Scenario: Stripe API timeout
- **WHEN** Stripe API call times out
- **THEN** request is retried up to 3 times with exponential backoff
- **AND** if all retries fail, order is marked "failed"

#### Scenario: Webhook delivery failure
- **WHEN** webhook handler is unavailable
- **THEN** Stripe retries for up to 3 days
- **AND** manual reconciliation job detects missing webhooks

#### Scenario: Database connection failure
- **WHEN** database is unavailable during order creation
- **THEN** payment intent is not created (fail fast)
- **AND** customer receives clear error message
