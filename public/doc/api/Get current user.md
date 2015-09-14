# Get current user

the authentication credential should be stored in a cookie named 'authentication_credential'.

## Url

/api/current_user.json

## Method

get

## version 1

### Expiration Date

no

### Parameters

key name | value type | required
--- | --- | ---
v | number | false

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
email | string | exists when is success
name | string | exists when is success