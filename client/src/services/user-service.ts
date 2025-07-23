
import { type VerifyEmailResponse, type ForgotPassResponse, type SignInResponse, type SignupResponse, type ResetPassResponse, type GetUserResponse, type GetDocumentsResponse, type CreateDocumentResponse, type DeleteDocumentResponse, type GetFilterDocsResponse,type GetDocOneResponse } from "../interfaces/interfaces";
import { API } from "./api";


const AuthService = {
    signup: (payload: {name: string,email: string,password: string}) => {
        return API.post<SignupResponse>("/api/v1/user/signup",payload)
    },
    signin: (payload: {email: string,password: string}) => {
        return API.post<SignInResponse>("/api/v1/user/signin",payload)
    },
    verifyemail: (verificationToken: string) => {
        return API.put<VerifyEmailResponse>(`/api/v1/user/verifyemail/${verificationToken}`)
    },
    forgotpassword: (payload: {email: string}) => {
        return API.post<ForgotPassResponse>("/api/v1/user/forgotpassword",payload)
    },
    forgotpassworddd: (resetPasswordToken: string) => {
        return API.post<ResetPassResponse>(`/api/v1/user/forgotpassword/${resetPasswordToken}`)
    },
    resetpassword: (payload: {password: string, confirmpassword: string, email: string}) => {
        return API.post<ResetPassResponse>("/api/v1/user/resetpassword",payload)
    },
    getuser: (token: string) => {
        return API.get<GetUserResponse>("/api/v1/user/",{ headers: {authorization: token} })
    },
    getdocuments: (token: string) => {
        return API.get<GetDocumentsResponse>("/api/v1/document/",{headers: {authorization: token}})
    },
    createdocument: (token: string) => {
        return API.post<CreateDocumentResponse>("/api/v1/document/",{},{headers: {authorization: token}})
    },
    deletedocument: (payload: {documentId: number,token: string}) => {
        return API.delete<DeleteDocumentResponse>(`/api/v1/document/delete/${payload.documentId}`,{headers: {authorization: payload.token}})
    },
    filterdocuments: (payload: {filter?:string, token: string}) => {
        return API.get<GetFilterDocsResponse>(`/api/v1/document/?filter=${payload.filter}`,{headers: {authorization: payload.token}})
    },
    updatecontent: (token: string,payload: {numericdocumentId: number,title?: string,content?: string}) => {
        return API.put(`/api/v1/document/update/${payload.numericdocumentId}`,payload,{headers: {authorization: token}})
    },
    getdocumentone: (token:string, numericdocumentId:number) => {
        return API.get<GetDocOneResponse>(`/api/v1/document/${numericdocumentId}`,{headers: {authorization: token}})
    }

}

export default AuthService