# Get organizations

## Url

/api/user/joined/organizations

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
errorCode | [ErrorCode](./Error codes.html) |
errorMessage | string | empty when is success
organizations | [Organization](#organization)[] | exists when is success

### Organization

key name | value type
--- | ---
id | number
name | string