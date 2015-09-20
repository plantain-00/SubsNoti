# Get organizations

## Url

/api/organizations.json

## Method

get

## version 1

### Expiration Date

no

### Parameters

key name | value type | required
--- | --- | ---
v | number | false
type | [OrganizationQueryType](#organizationquerytype) | true

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

### OrganizationQueryType

value | description
--- | ---
0 | the organizations current user in
1 | the organizations current user created