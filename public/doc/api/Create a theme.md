# Create a theme

## Url

/api/themes

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
themeTitle | string | true
themeDetail | string | false
organizationId | number | true

### Cookies

key name | value type | required
--- | --- | ---
authentication_credential | string | true

### Response Body

key name | value type | description
--- | --- | ---
isSuccess | boolean |
statusCode | number |
errorCode | [ErrorCode](./Error codes.html) |
errorMessage | string | empty when is success