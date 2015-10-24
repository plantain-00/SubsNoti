# Get themes of an organization

## Url

/api/organizations/:organization_id/themes

## Method

get

## version x

### Expiration Date

no

### [Parameters](./Parameters.html)

key name | value type | required | default value
--- | --- | --- | ---
page | number | false | 1
limit | number | false | 10
q | string | false | ''
isOpen | boolean | false | true
isClosed | boolean | false | false

### [Cookies](./Cookies.html)

### [Response Body](./Response.html)

key name | value type
--- | ---
themes | [Theme](#theme)[]
totalCount | number

### Theme

key name | value type
--- | ---
id | string
title | string
detail | string
organizationId | string
createTime | number
status | [ThemeStatus](./Theme status.html)
creator | [User](#user)
owners | [User](#user)[]
watchers | [User](#user)[]

### User

key name | value type
--- | ---
id | string
name | string
email | string
