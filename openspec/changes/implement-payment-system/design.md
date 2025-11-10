## Context

OpenSpec requires payment processing capabilities to support commercial transactions. This design addresses:
- Secure payment processing with PCI DSS compliance
- Stripe integration for payment gateway services
- Order lifecycle management
- Transaction auditing and reconciliation
- Payment method tokenization and storage

**Constraints:**
- PCI DSS Level 1 compliance required
- Payment processing latency must be < 3 seconds
- Support for multiple payment methods (cards, wallets)
- Must handle concurrent transactions safely

**Stakeholders:** Backend team, Security team, Compliance officer, Finance department

## Goals / Non-Goals

**Goals:**
- Integrate Stripe as primary payment gateway
- Implement secure order and transaction management
- Provide transaction history and reconciliation
- Support refunds and dispute handling
- Real-time payment status updates via webhooks

**Non-Goals:**
- Multiple payment gateway support (Stripe only in v1)
- Subscription billing (future enhancement)
- Cryptocurrency payments
- Invoice generation (separate capability)
- Tax calculation (integrate with third-party later)

## Architecture

### Payment Flow

```
Customer → Frontend → Backend API → Stripe API
                          ↓
                    Order Service
                          ↓
                   Transaction Log
                          ↑
                  Stripe Webhooks
```

### Data Model

**Orders:**
- `order_id` (UUID, primary key)
- `user_id` (FK to users)
- `amount` (decimal, currency smallest unit)
- `currency` (ISO 4217 code)
- `status` (enum: pending, processing, completed, failed, refunded)
- `stripe_payment_intent_id`
- `created_at`, `updated_at`

**Transactions:**
- `transaction_id` (UUID, primary key)
- `order_id` (FK to orders)
- `type` (enum: charge, refund, dispute)
- `amount`
- `status` (enum: pending, succeeded, failed)
- `stripe_charge_id`
- `metadata` (JSONB)
- `created_at`

**Payment Methods:**
- `payment_method_id` (UUID)
- `user_id` (FK)
- `stripe_payment_method_id` (tokenized)
- `type` (card, wallet)
- `last4`, `brand`, `exp_month`, `exp_year`
- `is_default` (boolean)

### State Machine

```
Order States:
pending → processing → completed
                    → failed
completed → refunded
```

## Decisions

### Decision 1: Use Stripe Payment Intents API
**Why:** Supports SCA (Strong Customer Authentication) for EU compliance, handles 3D Secure automatically, provides better fraud detection.

**Alternatives considered:**
- Stripe Charges API (deprecated, lacks SCA)
- Direct card processing (PCI compliance burden)
- PayPal only (limited market coverage)

### Decision 2: Webhook-based status updates
**Why:** Asynchronous payment confirmations are more reliable than polling, handles network failures gracefully.

**Implementation:**
- Stripe webhooks → API endpoint → Queue → Order state update
- Idempotency keys prevent duplicate processing
- Webhook signature verification for security

### Decision 3: Store minimal card data (tokens only)
**Why:** PCI DSS compliance requires not storing full card numbers. Stripe tokenization offloads this burden.

**Data stored:**
- Stripe token IDs (payment methods)
- Last 4 digits, brand, expiry (non-sensitive)
- Never store CVV or full PAN

### Decision 4: Optimistic locking for concurrent transactions
**Why:** Prevent race conditions when multiple webhooks arrive simultaneously.

**Implementation:**
- Database row versioning (`version` column)
- Retry logic with exponential backoff
- Transaction isolation level: SERIALIZABLE

## Security

### PCI DSS Compliance

**Level 1 Requirements (> 6M transactions/year):**
- No storage of full card numbers (use Stripe tokens)
- TLS 1.3 for all payment API calls
- Webhook signature verification
- Access logging for all payment operations
- Quarterly security audits

**Data Encryption:**
- At rest: AES-256 for transaction metadata
- In transit: TLS 1.3 minimum
- Stripe API keys stored in secrets manager (not env files)

**Access Control:**
- Payment operations require elevated permissions
- Audit trail for all refund/dispute actions
- Rate limiting: 100 requests/minute per user

### Fraud Prevention

- Stripe Radar for fraud detection (enabled by default)
- 3D Secure for high-risk transactions
- Velocity checks: max 5 failed attempts/hour
- Blacklist suspicious cards by fingerprint

## Migration Plan

**Phase 1: Foundation (Week 1)**
- Database schema creation
- Stripe API client setup
- Order service skeleton

**Phase 2: Payment Processing (Week 2)**
- Payment Intent creation
- Webhook handler
- Order state machine

**Phase 3: Management Features (Week 3)**
- Refund workflows
- Transaction history API
- Payment method management

**Rollback Plan:**
- Feature flag: `ENABLE_PAYMENTS` (default: false)
- Database migrations are reversible
- Stripe webhook can be disabled via dashboard

**Testing Strategy:**
- Stripe test mode for integration tests
- Mock webhooks for unit tests
- Load testing: 1000 concurrent payments
- Security penetration testing before production

## Risks / Trade-offs

**Risk: Stripe API downtime**
- **Mitigation:** Retry logic with exponential backoff, queue failed requests, fallback to manual processing

**Risk: Webhook delivery failures**
- **Mitigation:** Stripe retries for 3 days, manual reconciliation job checks for gaps

**Risk: PCI compliance violations**
- **Mitigation:** Security audit before launch, automated compliance checks in CI/CD

**Trade-off: Single payment gateway**
- **Pro:** Simpler integration, lower maintenance
- **Con:** Vendor lock-in, regional availability limits
- **Justification:** Stripe covers 95% of target markets, multi-gateway adds 3x complexity

**Trade-off: Synchronous vs Asynchronous processing**
- **Chosen:** Asynchronous (webhooks)
- **Pro:** Better reliability, handles slow payment networks
- **Con:** UI must handle pending states
- **Justification:** Payment confirmations can take 30+ seconds, blocking UX is unacceptable

## Open Questions

1. **Question:** Should we support payment method auto-update when cards expire?
   - **Proposal:** Use Stripe's automatic card updater feature
   - **Decision needed by:** Security team

2. **Question:** Refund approval workflow - automatic or manual?
   - **Proposal:** Auto-refund < $50, manual approval > $50
   - **Decision needed by:** Finance team

3. **Question:** Dispute handling - automate or manual process?
   - **Proposal:** Manual process with Stripe dashboard (low volume expected)
   - **Decision needed by:** Customer support team
