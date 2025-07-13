

export interface SignupResponse  {
    message: string
}

export interface SignInResponse {
    message: string
    token: string
}

export interface VerifyEmailResponse {
    verified: boolean,
    message: string
}

export interface ForgotPassResponse {
    message: string
}

export interface ResetPassResponse {
    message: string,
    email: string
}

// export type ForgotPasswordPayload = string
