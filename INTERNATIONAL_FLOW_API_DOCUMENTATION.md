# International Transfer API Flow

This document describes the API flow for creating and confirming an international money transfer.

Use the base URL provided by InstaPay:

```txt
{BASE_URL}
```

For APIs that require encrypted transport, examples below show the readable JSON payload first. In production, send the agreed encrypted wrapper:

```json
{
  "data": "<encrypted_payload>"
}
```

All secured endpoints require authentication headers.

## Flow Summary

1. Select recipient type and sender type.
2. Load destination countries.
3. Load payout channels and payers.
4. Get payer details and required fields.
5. Get initial quote/rate.
6. Select beneficiary.
7. Select payment method.
8. Recalculate final quote/rate.
9. Create quotation if provider is Thunes.
10. Create transaction and send OTP.
11. Confirm transaction based on payment method.

Transaction type values:

```txt
C2C = Individual sender to individual recipient
C2B = Individual sender to business recipient
B2C = Business sender to individual recipient
B2B = Business sender to business recipient
```

## 1. Get Destination Countries

### GET `/api/payment/countries/{senderCountryIso3}`

Purpose:

Returns countries available for international transfers from the sender country.

Path params:

```txt
senderCountryIso3 = CHE
```

Example:

```http
GET /api/payment/countries/CHE
```

Basic response:

```json
[
  {
    "_id": "country_config_id",
    "countryIso3": "PAK"
  }
]
```

## 2. Get Payout Channels

### GET `/api/payment/services/{destinationCountryIso3}/{senderCountryIso3}`

Purpose:

Returns available payout channels for the selected destination country.

Path params:

```txt
destinationCountryIso3 = PAK
senderCountryIso3 = CHE
```

Example:

```http
GET /api/payment/services/PAK/CHE
```

Basic response:

```json
{
  "services": [
    {
      "id": 2,
      "name": "Bank Account",
      "method": "Bank Account - thunes"
    },
    {
      "id": 1,
      "name": "Mobile Wallet",
      "method": "Mobile Wallet - neema"
    }
  ]
}
```

Supported payout channel examples:

```txt
Bank Account
Mobile Wallet
Cash Pickup
Payment Card
```

Provider is usually identified from the service method, for example:

```txt
thunes
neema
```

## 3. Get Payers

### POST `/api/payment/payers`

Purpose:

Returns available payers for the selected country, payout channel, provider, and transaction type.

Payload:

```json
{
  "country": "PAK",
  "service": "Bank Account",
  "vendor": "thunes",
  "transaction_type": "C2C"
}
```

Basic response:

```json
[
  {
    "id": "payer_123",
    "name": "Example Bank",
    "country_iso_code": "PAK",
    "currency": "PKR",
    "transaction_types": {
      "C2C": true,
      "B2C": true
    }
  }
]
```

Alternative response format:

```json
{
  "destinations": [
    {
      "country": "PAK",
      "destinationId": "destination_123",
      "destinationName": "Example Mobile Wallet",
      "currencies": ["PKR"],
      "destinationType": "mobile"
    }
  ]
}
```

## 4. Get Payer Details

### GET `/api/payment/get-payer-details`

Purpose:

Returns destination currency and required beneficiary/vendor fields for the selected payer.

Query params:

```txt
payerId=payer_123
vendor=thunes
transaction_type=C2C
```

Example:

```http
GET /api/payment/get-payer-details?payerId=payer_123&vendor=thunes&transaction_type=C2C
```

Basic response:

```json
{
  "data": {
    "destination_currency": "PKR",
    "payer_required_fields": [
      ["firstname", "lastname", "date_of_birth", "address", "bank_account_number", "id_number"]
    ]
  }
}
```

## 5. Get Initial Quote / Rate

### GET `/api/payment/markup-rates`

Purpose:

Returns initial exchange rate, recipient amount, fee, min/max limits, user limits, and quote token.

Query params:

```txt
from=CHF
to=PKR
amount=100
fromOrTo=from
service_name=international_bank_transfer
account_id=account_123
payer_id=payer_123
service_id=2
vendor=thunes
transaction_type=C2C
```

`fromOrTo` values:

```txt
from = sender entered send amount
to = sender entered receive amount
```

`service_name` values:

```txt
international_bank_transfer
international_mobile_wallet
international_card_payment
international_cash_pickup
```

Example:

```http
GET /api/payment/markup-rates?from=CHF&to=PKR&amount=100&fromOrTo=from&service_name=international_bank_transfer&account_id=account_123&payer_id=payer_123&service_id=2&vendor=thunes&transaction_type=C2C
```

Basic response:

```json
{
  "data": {
    "exchangeRate": 315.52,
    "recipientAmount": 31552,
    "minimumValue": 1,
    "maximumValue": 5000,
    "token": "quote_rate_token",
    "result": {
      "fee": {
        "value": 3.5
      },
      "total": {
        "value": 103.5
      }
    },
    "limits": {
      "daily_sending_limit": 10000,
      "monthly_sending_limit": 50000,
      "yearly_sending_limit": 250000
    },
    "limits_used": {
      "daily_sending_limit_used": 1000,
      "monthly_sending_limit_used": 2000,
      "yearly_sending_limit_used": 10000
    }
  }
}
```

Important:

The returned `token` is required in later rate, quotation, and transaction APIs.

## 6. Check Provider Balance

### GET `/api/payment/balance`

Purpose:

Checks provider liquidity for the selected currency.

Query params:

```txt
vendor=thunes
currency=CHF
```

Example:

```http
GET /api/payment/balance?vendor=thunes&currency=CHF
```

Basic response:

```json
{
  "data": {
    "balance": 10000,
    "balanceInUSD": 11200
  }
}
```

## 7. Get Beneficiaries

### GET `/api/beneficiary/get-user-beneficiaries/{accountId}`

Purpose:

Returns saved beneficiaries for the authenticated account.

Example:

```http
GET /api/beneficiary/get-user-beneficiaries/account_123
```

Basic response:

```json
{
  "beneficiaryList": [
    {
      "_id": "beneficiary_123",
      "beneficiary_type": "individual",
      "first_name": "Ali",
      "last_name": "Khan",
      "country_iso_code": "PAK",
      "address": "Street 1",
      "account_type": ["bank"],
      "bank_details": [
        {
          "_id": "bank_123",
          "name": "Example Bank",
          "account_number": "1234567890"
        }
      ],
      "mobile_wallet": [
        {
          "_id": "wallet_123",
          "money_provider": "payer_456",
          "wallet_account_number": "923001234567"
        }
      ],
      "extras": {}
    }
  ]
}
```

Selection rules:

- Beneficiary country should match destination country.
- Beneficiary type should match transaction recipient type.
- For bank payout, bank details are required.
- For mobile wallet payout, mobile wallet details are required.

## 8. Update Missing Beneficiary Details

### PUT `/api/beneficiary/update-beneficiary/{beneficiaryId}`

Purpose:

Updates missing beneficiary details required by the selected payer.

Payload example:

```json
{
  "_id": "beneficiary_123",
  "first_name": "Ali",
  "last_name": "Khan",
  "address": "Updated recipient address",
  "date_of_birth": "1990-01-01",
  "extras": {
    "id_country_iso_code": "PAK",
    "id_number": "AB123456",
    "occupation": "Engineer"
  }
}
```

Basic response:

```json
{
  "beneficiaryData": {
    "_id": "beneficiary_123",
    "first_name": "Ali",
    "last_name": "Khan",
    "address": "Updated recipient address",
    "extras": {
      "id_number": "AB123456"
    }
  }
}
```

## 9. Third-Party Sender APIs

These APIs are only used when the transaction is sent on behalf of a third party.

### GET `/api/sender/get-user-senders/{accountId}`

Purpose:

Returns saved third-party senders.

Example:

```http
GET /api/sender/get-user-senders/account_123
```

Basic response:

```json
{
  "senderList": [
    {
      "_id": "sender_123",
      "sender_type": "individual",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+41790000000",
      "country_iso_code": "CHE"
    }
  ]
}
```

### POST `/api/sender/add`

Purpose:

Adds a third-party sender.

Content type:

```txt
multipart/form-data
```

Form fields:

```txt
data = JSON string
id_front = optional file
id_back = optional file
selfie = optional file
kyb_registry_extract = optional file
kyb_proof_of_authority = optional file
kyb_ubos = optional file
kyb_id_collection = optional file
kyb_additional_docs = optional file
```

Example `data`:

```json
{
  "sender_type": "individual",
  "first_name": "John",
  "last_name": "Doe",
  "dob": "1990-01-01",
  "phone": "+41790000000",
  "email": "john@example.com",
  "address": "Street 1",
  "city": "Zurich",
  "country_name": "Switzerland",
  "country_iso_code": "CHE",
  "save_for_future": true,
  "account": "account_123",
  "extras": {
    "idNumber": "AB123456",
    "documentType": "passport"
  }
}
```

Basic response:

```json
{
  "senderData": {
    "_id": "sender_123",
    "sender_type": "individual",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### PUT `/api/sender/update-sender/{senderId}`

Purpose:

Updates a saved third-party sender.

Payload:

Same `multipart/form-data` shape as add sender.

### DELETE `/api/sender/delete-sender/{senderId}/{accountId}`

Purpose:

Deletes a saved third-party sender.

## 10. Neema Purpose List

### GET `/api/payment/get-neema-reasons/{destinationCountryIso3}/{transactionType}`

Purpose:

Returns purpose-of-payment options for Neema transfers.

Condition:

Only used when provider is `neema`.

Example:

```http
GET /api/payment/get-neema-reasons/PAK/C2C
```

Basic response:

```json
{
  "FAMILY_SUPPORT": "Family Support",
  "EDUCATION": "Education",
  "MEDICAL": "Medical"
}
```

For Thunes, purpose values are selected from the predefined Thunes purpose list.

## 11. Get Available Payment Methods

### GET `/api/payment/get-available-methods/{accountId}/{senderCountryIso3}`

Purpose:

Returns payment methods available to the sender.

Example:

```http
GET /api/payment/get-available-methods/account_123/CHE
```

Basic response:

```json
{
  "data": ["wallet", "card", "paypal", "mobile_wallet", "bank"]
}
```

Supported payment methods in this flow:

```txt
wallet
card
paypal
mobile_wallet
```

## 12. Mobile Wallet Payment Method Setup

These APIs are for funding the transfer by mobile wallet.

### GET `/api/collection/get-services/{senderCountryIso3}`

Purpose:

Returns mobile wallet collection services available in the sender country.

Example:

```http
GET /api/collection/get-services/CHE
```

Basic response:

```json
{
  "data": {
    "merchant_id": "merchant_123",
    "services": [
      {
        "id": 1,
        "name": "Mobile Wallet",
        "service_name": "wallet"
      }
    ]
  }
}
```

### GET `/api/collection/get-payers/{senderCountryIso3}/{serviceName}`

Purpose:

Returns mobile wallet payers for the selected collection service.

Example:

```http
GET /api/collection/get-payers/CHE/wallet
```

Basic response:

```json
{
  "data": {
    "payers": [
      {
        "id": 1,
        "name": "Example Mobile Money",
        "active": true
      }
    ]
  }
}
```

## 13. Recalculate Final Rate

### POST `/api/payment/rates/{payerId}`

Purpose:

Recalculates the final rate, fee, and total after payment method selection.

Payload:

```json
{
  "wallet_id": "funding_wallet_123",
  "transaction_type": "C2C",
  "amount": 100,
  "service_name": "international_bank_transfer",
  "service_id": 2,
  "channel_name": "bank_account",
  "iso_code": "PAK",
  "account_id": "account_123",
  "currency_code": "CHF",
  "avoid_balance": false,
  "avoid_top_up_fee": false,
  "payment_method": "wallet",
  "vendor": "thunes",
  "token": "quote_rate_token"
}
```

`channel_name` values:

```txt
bank_account
mobile_money
card_payment
cash_pickup
```

Payment method notes:

```txt
wallet        Uses selected InstaPay wallet
card          Sets avoid_top_up_fee=true
paypal        May return PayPal conversion details
mobile_wallet Uses mobile wallet collection
```

Basic response:

```json
{
  "data": {
    "result": {
      "exchanged_rate": {
        "value": 315.52
      },
      "recipient": {
        "currency": "PKR",
        "value": 31552
      },
      "sending": {
        "currency": "CHF",
        "value": 100
      },
      "fee": {
        "currency": "CHF",
        "value": 3.5
      },
      "total": {
        "currency": "CHF",
        "value": 103.5
      },
      "external_transaction_data": {}
    }
  }
}
```

PayPal response addition:

```json
{
  "paypal": {
    "paypal_currency_supported": false,
    "fee": {
      "currency": "CHF",
      "value": 103.5
    },
    "paypal_rate": {
      "value": 1.12
    },
    "paypal_converted": {
      "currency": "USD",
      "value": 115.92
    }
  }
}
```

## 14. Create Thunes Quotation

### POST `/create-quotation`

Purpose:

Creates a quotation before transaction creation.

Condition:

Only used when provider is `thunes`.

Payload:

```json
{
  "token": "quote_rate_token",
  "payerId": "payer_123",
  "wallet_id": "funding_wallet_123",
  "transaction_type": "C2C",
  "payment_method": "wallet"
}
```

Basic response:

```json
{
  "QuotationID": "quotation_123",
  "Source": {
    "amount": 100,
    "currency": "CHF"
  },
  "Destination": {
    "amount": 31552,
    "currency": "PKR"
  },
  "Fee": {
    "amount": 3.5,
    "currency": "CHF"
  }
}
```

For non-Thunes providers, skip this step.

## 15. Create Transaction And Send OTP

### Thunes: POST `/createTransaction/{quotationId}`

Purpose:

Creates the transaction from quotation and sends OTP.

Payload:

```json
{
  "additional_information": "Invoice 123",
  "purpose_of_remittance": "FAMILY_SUPPORT",
  "user_id": "user_or_company_id",
  "beneficiary_id": "beneficiary_123",
  "sender_id": "sender_123",
  "service": {
    "id": 2
  },
  "transaction_type": "C2C",
  "wallet_id": "funding_wallet_123",
  "token": "quote_rate_token",
  "vendor": "thunes",
  "type": "sms",
  "bank_id": "bank_123"
}
```

For mobile wallet payout:

```json
{
  "mobile_wallet_id": "mobile_wallet_123"
}
```

Basic response:

```json
{
  "token": "transaction_otp_token",
  "transaction_id": "transaction_123",
  "status": "otp_sent"
}
```

### Non-Thunes: POST `/api/wallet/send-otp`

Purpose:

Creates transaction draft and sends OTP.

Payload:

```json
{
  "data": {
    "additional_information": "Invoice 123",
    "purpose_of_remittance": "FAMILY_SUPPORT",
    "user_id": "user_or_company_id",
    "beneficiary_id": "beneficiary_123",
    "sender_id": "sender_123",
    "service": {
      "id": 2
    },
    "transaction_type": "C2C",
    "wallet_id": "funding_wallet_123",
    "token": "quote_rate_token",
    "vendor": "neema",
    "bank_id": "bank_123"
  },
  "type": "sms"
}
```

Basic response:

```json
{
  "token": "transaction_otp_token",
  "transaction_id": "transaction_123",
  "status": "otp_sent"
}
```

OTP type values:

```txt
sms
authenticator
```

## 16. Resend OTP

### Thunes: POST `/api/wallet/otp-send`

Purpose:

Resends OTP for an existing Thunes transaction.

Payload:

```json
{
  "data": {
    "token": "transaction_resend_token"
  },
  "type": "sms"
}
```

Basic response:

```json
{
  "token": "transaction_otp_token",
  "status": "otp_sent"
}
```

### Non-Thunes: POST `/api/wallet/send-otp`

Purpose:

Resends OTP for non-Thunes transaction flow.

Payload:

Same payload as transaction draft creation.

## 17. Confirm Wallet Payment

Used when payment method is:

```txt
wallet
```

### Thunes: POST `/confirmTransaction`

Purpose:

Confirms Thunes transfer after OTP.

Content type:

```txt
multipart/form-data
```

Form fields:

```txt
token = transaction_otp_token
otp = 123456
type = sms
description = optional transfer note
files = optional supporting file attachments
```

Basic response:

```json
{
  "data": {
    "transaction_id": "transaction_123",
    "status": "processing",
    "amount": 100,
    "currency": "CHF"
  }
}
```

### Non-Thunes: POST `/api/payment/confirm-transaction`

Purpose:

Confirms non-Thunes transfer after OTP.

Payload:

```json
{
  "token": "transaction_otp_token",
  "otp": "123456",
  "type": "sms"
}
```

Basic response:

```json
{
  "data": {
    "transaction_id": "transaction_123",
    "status": "processing",
    "amount": 100,
    "currency": "CHF"
  }
}
```

## 18. Confirm Card Payment

Used when payment method is:

```txt
card
```

### GET `/api/trust-payment/get-user-pan-list/{accountId}`

Purpose:

Returns saved payment cards.

Example:

```http
GET /api/trust-payment/get-user-pan-list/account_123
```

Basic response:

```json
{
  "panList": [
    {
      "_id": "pan_123",
      "last4": "4242"
    }
  ]
}
```

### POST `/api/trust-payment/check-card-expiry`

Purpose:

Checks if a saved card is expired.

Payload:

```json
{
  "card_id": "pan_123"
}
```

Basic response:

```json
{
  "isExpired": false,
  "message": "Card is valid"
}
```

### POST `/api/trust-payment/initiat-international-transaction`

Purpose:

Initializes card payment for a new card after OTP verification.

Payload:

```json
{
  "token": "transaction_otp_token",
  "otp": "123456",
  "type": "sms",
  "panData": {
    "wallet_id": "source_wallet_123",
    "amount": 10350,
    "payment_type": "card",
    "sender_id": "sender_123",
    "is_card_save": true,
    "card_token": "tokenized_card_details"
  }
}
```

Note:

`amount` is sent in minor units. Example: `103.50` becomes `10350`.

Basic response:

```json
{
  "transaction_id": "card_transaction_123",
  "intlToken": "intl_token_123",
  "trustPaymentToken": "trust_payment_jwt"
}
```

### POST `/api/trust-payment/initiat-international-pan-transaction`

Purpose:

Initializes card payment using a saved card.

Payload:

```json
{
  "token": "transaction_otp_token",
  "otp": "123456",
  "type": "sms",
  "panData": {
    "wallet_id": "source_wallet_123",
    "amount": 10350,
    "payment_type": "card",
    "pan": "pan_123"
  }
}
```

### POST `/api/trust-payment/confirm-international-transaction/{transactionId}/{intlToken}`

Purpose:

Confirms hosted card payment for a new card.

Example:

```http
POST /api/trust-payment/confirm-international-transaction/card_transaction_123/intl_token_123
```

### POST `/api/trust-payment/confirm-international-pan-transaction/{transactionId}/{intlToken}`

Purpose:

Confirms hosted card payment for a saved card.

Example:

```http
POST /api/trust-payment/confirm-international-pan-transaction/card_transaction_123/intl_token_123
```

## 19. Confirm PayPal Payment

Used when payment method is:

```txt
paypal
```

### Thunes: POST `/api/paypal/initiate-international-payment`

Purpose:

Verifies OTP and starts PayPal payment flow for Thunes.

Payload:

```json
{
  "token": "transaction_otp_token",
  "otp": "123456",
  "type": "sms"
}
```

Basic response:

```json
{
  "url": "https://paypal.example/checkout/approval"
}
```

### Non-Thunes: POST `/api/paypal/initiate-international-payout`

Purpose:

Verifies OTP and starts PayPal payment flow for non-Thunes providers.

Payload:

```json
{
  "token": "transaction_otp_token",
  "otp": "123456",
  "type": "sms"
}
```

Basic response:

```json
{
  "url": "https://paypal.example/checkout/approval"
}
```

## 20. Confirm Mobile Wallet Payment

Used when payment method is:

```txt
mobile_wallet
```

### POST `/api/collection/international`

Purpose:

Verifies OTP and starts mobile wallet collection for the international transfer.

Payload:

```json
{
  "token": "transaction_otp_token",
  "otp": "123456",
  "type": "sms"
}
```

Basic response:

```json
{
  "data": {
    "transaction_id": "transaction_123",
    "status": "pending",
    "collection_reference": "collection_123"
  }
}
```

### POST `/api/thunes/confirm-transaction-topup`

Purpose:

Confirms the international transaction after payment/top-up callback.

Payload:

```json
{
  "token": "transaction_token_from_callback"
}
```

Basic response:

```json
{
  "data": {
    "transaction_id": "transaction_123",
    "status": "processing"
  }
}
```

## 21. Optional Transaction Notes

### GET `/api/transaction-notes/get-notes`

Purpose:

Returns informational notes for a corridor and payout method.

Query params:

```txt
from=CHE
to=PAK
method=bank
```

Example:

```http
GET /api/transaction-notes/get-notes?from=CHE&to=PAK&method=bank
```

Basic response:

```json
{
  "notes": [
    {
      "note": "Bank transfers may take one business day."
    }
  ]
}
```

## Provider Branches

### Thunes Flow

1. Get countries.
2. Get payout channels.
3. Get payers.
4. Get payer details.
5. Get initial quote/rate.
6. Select beneficiary and payment method.
7. Recalculate final rate.
8. Create quotation with `/create-quotation`.
9. Create transaction and send OTP with `/createTransaction/{quotationId}`.
10. Confirm based on payment method:
    - Wallet: `/confirmTransaction`
    - Card: TrustPayment initiate and confirm endpoints
    - PayPal: `/api/paypal/initiate-international-payment`
    - Mobile wallet: `/api/collection/international`

### Neema / Non-Thunes Flow

1. Get countries.
2. Get payout channels.
3. Get payers.
4. Get payer details.
5. Get initial quote/rate.
6. If provider is Neema, get purposes from `/api/payment/get-neema-reasons/{destinationCountryIso3}/{transactionType}`.
7. Select beneficiary and payment method.
8. Recalculate final rate.
9. Create transaction and send OTP with `/api/wallet/send-otp`.
10. Confirm based on payment method:
    - Wallet: `/api/payment/confirm-transaction`
    - Card: TrustPayment initiate and confirm endpoints
    - PayPal: `/api/paypal/initiate-international-payout`
    - Mobile wallet: `/api/collection/international`

## Common Error Codes

```txt
internal_server_error
invalid_token
token_expired
invalid_card_details
incorrect_card
transaction_failed
feature_not_allowed
beneficiary_details_missing
insufficient_funds
receiver_wallet_not_found
shipping_details_required
```

Common rate and limit errors:

```txt
payer_unavailable
insufficient balance payer
max payer
min payer
Invalid Amount Fee
limit exceeded
```
