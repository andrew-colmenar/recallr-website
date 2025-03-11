POST
/api/v1/signup/request
Request:
{
  "email": "abc@gmail.com",
  "device_info": {
    "device_type": "mobile",
    "operating_system": "string",
    "browser_version": "string",
    "browser_name": "string"
  }
}

Response:
{
  "detail": "string",
  "transaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "otp_expires_at": "2025-03-11T08:55:54.393Z"
}

POST
/api/v1/signup/complete
REQUEST:
{
  "user": {
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  },
  "password": "string",
  "transaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}

RESPONSE:
{
  "detail": "string",
  "session": {
    "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created_at": "2025-03-11T08:56:59.991Z",
    "last_active_at": "2025-03-11T08:56:59.991Z"
  },
  "user": {
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}

POST
/api/v1/otp/verify

request:
{
  "transaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "string"
}

REPONSE:    
{
  "detail": "string"
}


POST
/api/v1/otp/resend

request:
{
  "transaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
response:
{
  "detail": "string",
  "transaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "otp_expires_at": "2025-03-11T08:58:26.504Z"
}

POST
/api/v1/login/request

request:
{
  "email": "string",
  "password": "string",
  "device_info": {
    "device_type": "mobile",
    "operating_system": "string",
    "browser_version": "string",
    "browser_name": "string"
  }
}

response:
{
  "detail": "string",
  "transaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "otp_expires_at": "2025-03-11T08:58:57.260Z"
}

POST
/api/v1/login/complete
request:
{
  "transaction_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
reposne:
{
  "session": {
    "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created_at": "2025-03-11T09:07:04.342Z",
    "last_active_at": "2025-03-11T09:07:04.342Z"
  },
  "user": {
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}

POST
/api/v1/otp/verify
same as above

POST
/api/v1/otp/resend
same as above


POST
/api/v1/logout

request:
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}

response:
{
  "detail": "string"
}

POST
/api/v1/sessions/current

request:
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}

response:
{
  "user": {
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  },
  "session": {
    "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "created_at": "2025-03-11T09:04:08.553Z",
    "last_active_at": "2025-03-11T09:04:08.553Z"
  }
}


POST
/api/v1/sessions/all
request:
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "device_info": {
    "device_type": "mobile",
    "operating_system": "string",
    "browser_version": "string",
    "browser_name": "string"
  }
}

response:
"string"

POST
/api/v1/sessions/{user_id}/{session_id}/revoke

request:
done using parameters
 response:

 "string"


POST
/api/v1/sessions/validate-session

Validate a user session.

Args: request (ValidateUserSessionRequest): Request containing session and user IDs db (Session): Database session

Returns: Response: 200 OK if session is valid

Raises: HTTPException: 401 if session is invalid

request:
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}

response:
"string"



