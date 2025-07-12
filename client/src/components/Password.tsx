import { useState } from "react"
import AuthService from "../services/user-service"
import { useNavigate, useParams } from "react-router-dom"

function Password() {
    const [email,setEmail] = useState("")

    const {verificationToken} = useParams()

    const navigate = useNavigate()
  return (
        <div className="bg-gray-300 h-screen w-screen flex justify-center items-center" >
            <div className="bg-white w-[500px] h-[250px] flex flex-col shadow-2xl rounded-lg items-center p-5 gap-4" >
                <h1 className="text-4xl font-bold" >Forgot Your Password?</h1>
                <p className="text-lg font-medium text-sky-600" >Please enter your linked email address</p>
                <input className="w-[80%] border border-slate-300 rounded-lg p-1.5" type="text" placeholder="abc@xyz.com"
                value={email} onChange={(e) => {setEmail(e.target.value)}}></input>
                <button onClick={async () => {
                  try {
                    const response = await AuthService.forgotpassword({email})
                    alert(response.data.message)

                  } catch (error) {
                    
                  }
                }} className="bg-sky-600 w-[80%] p-2 mt-2 text-white rounded">Send Reset Link</button>
            </div>
    </div>
  )
}

export default Password
