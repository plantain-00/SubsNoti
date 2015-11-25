# get current user

the authentication credential should be stored in a cookie named 'authentication_credential'.

## url

`GET` `/api/user`

### [headers](../request/headers.html)

### [cookies](../request/cookies.html)

### [response body](../response.html)

key name | value type
--- | ---
id | string
email | string
name | string
createdOrganizationCount | number
joinedOrganizationCount | number
avatar | string
