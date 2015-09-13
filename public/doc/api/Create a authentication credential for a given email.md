# Create a authentication credential for a given email

will send a link with it to the given email.

## Url

/api/authentication_credential

## Method

post

## ContentType

application/json

## API Expiration Date

no

## version 1

### Expiration Date

no

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
statusCode | number | 0 when is success
errorCode | number | 0 when is success
errorMessage | string | '' when is success