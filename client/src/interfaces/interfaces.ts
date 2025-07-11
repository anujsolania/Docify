

export interface SignupPayload {
    name: string,
    email: string,
    password: string
}

export interface SignupResponse  {
    message: string
}

export interface SigninPayload {
    email: string,
    password: string
}

export interface SignInResponse {
    message: string
    token: string
}