# Theme

## version >=0.10.2

### Expiration Date

no

### Models

key name | value type
--- | ---
id | string
title | string
detail | string
organizationId | string
createTime | ISO 8601 time string
updateTime | ISO 8601 time string?
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
avatar | string

## version >=0.10.0

### Expiration Date

2015-11-22

### Models

key name | value type
--- | ---
id | string
title | string
detail | string
organizationId | string
createTime | number
updateTime | number?
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
avatar | string