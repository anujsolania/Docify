import {   type SigninPayload, type SignInResponse, type SignupPayload, type SignupResponse} from "../interfaces/interfaces";
import { API } from "./api";


const AuthService = {
    signup: (payload: SignupPayload) => {
        return API.post<SignupResponse>("/api/v1/user/signup",payload)
    },
    signin: (payload: SigninPayload) => {
        return API.post<SignInResponse>("/api/v1/user/signin",payload)
    }
}

export default AuthService