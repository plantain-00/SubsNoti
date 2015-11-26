# response

### values

key name | value type | description
--- | --- | ---
isSuccess | boolean |
statusCode | number |
errorMessage | string | exists when fail
stack | string | exists when fail and debug
documentUrl | string | exists when fail
actualErrorMessage | string | exists when an error happens unexpectedly

### headers

key name | value type | description
--- | --- | ---
X-RateLimit-Limit | number | the maximum number of requests that the consumer is permitted to make per hour
X-RateLimit-Remain | number |
X-RateLimit-ResetMoment | ISO 8601 time string |
