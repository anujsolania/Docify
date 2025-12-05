
export interface User {
  id: number
  name: string
  email: string
  isVerified: boolean | null
}

export interface SignupResponse  {
    message: string
}

export interface SignInResponse {
    message: string
    token: string
    user: User
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
export interface Alldocuments {
  ownedbyme: Document[]
  notownedbyme: Document[]
  ownedbyanyone: Document[]
}

export interface GetDocumentsResponse {
  alldocuments: Alldocuments
}

export interface CreateDocumentResponse {
    message: string
    document: Document
}
export interface DeleteDocumentResponse {
    message: string
}

export interface GetFilterDocsResponse {
    filtereddocuments: Document[]
}

export interface GetDocOneResponse {
    document: Document
    permission: string
}

export interface ShareDocument {
    message: string
}

// export type ForgotPasswordPayload = string

export interface User {
  id: number
  name: string
  email: string
  password: string
  isVerified: boolean | null
}

export interface Collaborator {
  id: number
  userId: number
  docId: number
  permission: "VIEW" | "EDIT"
  user: User
}

export interface GetCollaboratorsResponse {
  collaborators: Collaborator[]
}


export interface TokenPayload {
    email: string
    id: number
}