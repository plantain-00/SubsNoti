# Send token via email

will send a link with it to the given email.

## Url

/api/token_sent

## Method

post

## ContentType

application/json

## version 1

### Expiration Date

no

### Parameters

key name | value type | required
--- | --- | ---
v | number | false

### Request Body

key name | value type | required
--- | --- | ---
emailHead | string | true
emailTail | string | true
name | string | false

### Response Body

key name | value type | description
--- | --- | ---
isSuccess | boolean |
statusCode | number |
errorCode | [ErrorCode](./Error codes.html) |
errorMessage | string | empty when is success