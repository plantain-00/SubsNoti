# Get themes of an organization

## Url

/api/organizations/:organization_id/themes

## Method

get

## version 1

### Expiration Date

no

### [Parameters](./Parameters.html)

### [Cookies](./Cookies.html)

### [Response Body](./Response.html)

key name | value type
--- | ---
themes | [Theme](#theme)[]

### Theme

key name | value type
--- | ---
id | string
title | string
detail | string
organizationId | string
createTime | number
creator | [User](#user)
owners | [User](#user)[]
watchers | [User](#user)[]

### User

key name | value type
--- | ---
id | string
name | string
email | string