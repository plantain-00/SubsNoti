# Get authentication credential

will get authentication credential, and then store it to a cookie named 'authentication_credential', and then will redirect to home page.

## Url

/api/authentication_credential.html

## Method

get

## version 1

### Expiration Date

no

### Parameters

key name | value type | required
--- | --- | ---
v | number | false
token | string | true

### Response Body

key name | value type | description
--- | --- | ---
isSuccess | boolean |
statusCode | number | 0 when is success
errorCode | number | 0 when is success
errorMessage | string | '' when is success