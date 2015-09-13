# Get current user

the authentication credential should be stored in a cookie named 'authentication_credential'.

## Url

/api/current_user.json

## Method

get

## API Expiration Date

no

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
statusCode | number | 0 when is success
errorCode | number | 0 when is success
errorMessage | string | '' when is success
email | string | exists when is success
name | string | exists when is success