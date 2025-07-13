
import { type VerifyEmailResponse, type ForgotPassResponse, type SignInResponse, type SignupResponse, type ResetPassResponse } from "../interfaces/interfaces";
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
    }
}

export default AuthService