# Get themes

## Url

/api/themes.json

## Method

get

## version 1

### Expiration Date

no

### Parameters

key name | value type | required
--- | --- | ---
v | number | false
type | [ThemeQueryType](#themequerytype) | true
organizationId | number | false

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

### ThemeQueryType

value | description
--- | ---
0 | the themes in an organization