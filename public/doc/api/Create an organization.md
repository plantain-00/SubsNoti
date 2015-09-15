# Create an organization

## Url

/api/organization

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
organizationName | string | true

### Cookies

key name | value type | required
--- | --- | ---
authentication_credential | string | true

### Response Body

key name | value type | description
--- | --- | ---
isSuccess | boolean |
statusCode | number |
errorCode | number | 0 when is success
errorMessage | string | empty when is success