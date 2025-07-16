

export interface SignupResponse  {
    message: string
}

export interface SignInResponse {
    message: string
    token: string
}

export interface VerifyEmailResponse {
    verified: boolean
    message: string
}

export interface ForgotPassResponse {
    message: string
}

export interface ResetPassResponse {
    message: string
    email: string
}
export interface GetUserResponse {
    username: string
}

export interface Document {
    id: number
    title?: string
    content?: string
    updatedAt: Date
    userId: number
}
export interface GetDocumentsResponse {
    documents: Document[]
}

export interface CreateDocumentResponse {
    message: string
    document: Document
}

// export type ForgotPasswordPayload = string
