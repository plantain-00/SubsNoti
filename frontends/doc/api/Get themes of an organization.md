# Get themes of an organization

## Url

/api/organizations/:organization_id/themes

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
themes | [Theme](#theme)[] | exists when is success

### Theme

key name | value type
--- | ---
id | number
title | string
detail | string
organizationId | number
createTime | number