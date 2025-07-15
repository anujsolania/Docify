import { useState } from "react"
import { Link } from "react-router-dom"
import AuthService from "../services/user-service"

function Signin() {
     const [postInputs,setpostInputs] = useState({
        email: "",
        password: ""
    })

  return (
    <div className="bg-gray-300 min-h-screen flex justify-center items-center" >
        <div className="bg-white rounded-lg h-[430px] w-[400px] shadow-2xl p-6" >
        <div className="m-5" >
            <div className="text-4xl font-extrabold flex justify-center" >Get Started</div>
            <div className="text-sky-600 font-medium mt-1 flex justify-center" >Don't have an account? <Link to={"/signup"} className="underline ml-1"> SignUp </Link></div>
        </div>
        <div className="flex justify-center " >
            <div className="flex flex-col w-[90%] gap-5 justify-center">
               <div className="flex flex-col gap-1" >
                    <div>Email</div>
                    <input type="text" placeholder="abc@gmail.com" className="border border-slate-300 rounded-lg w-full p-2 bg-slate-50"
                    value={postInputs.email} onChange={(e) => {setpostInputs({
                        ...postInputs,
                        email: e.target.value
                    })}}></input>
                </div>
                <div className="flex flex-col gap-1" >
                    <div>Password</div>
                    <input type="password" placeholder="*******" className="border border-slate-300 rounded-lg w-full p-2 bg-slate-50"
                    value={postInputs.password} onChange={(e) => {setpostInputs({
                        ...postInputs,
                        password: e.target.value
                    })}}></input>
                </div>
                <div className="mt-1 text-center">
                    <button className="w-full bg-sky-600 rounded-lg p-2.5 text-white"
                    onClick={async () => {
                        try {
                        const response = await AuthService.signin(postInputs)
                        const token = response.data.token
                        sessionStorage.setItem("token",token)
                        alert(response.data.message)
                        // navigate("/home") 
                        } catch (error: any) {
                            alert(error.response.data.error)
                        }
                    }}>Sign In</button>
                    <div className="m-2" >
                        <Link to={"/forgotpassword"} className="text-md text-sky-600 underline">Forgot Password ?</Link>
                    </div>
                </div>
            </div>
        </div>
        <div>

        </div>
        </div>
    </div>
  )
}

export default Signin
