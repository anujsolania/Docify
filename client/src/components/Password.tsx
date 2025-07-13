import { useEffect, useState } from "react"
import AuthService from "../services/user-service"
import { useNavigate, useParams } from "react-router-dom"

function Password() {
    const [email,setEmail] = useState("")
    const[resetPass,setresetPass] = useState(false)

    const [postInputs,setpostInputs] = useState({
      password: "",
      confirmpassword: "",
      email: ""
    })

    const {resetpasswordToken} = useParams()

    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            if (resetpasswordToken) {
                try {
                    const response = await AuthService.forgotpassworddd(resetpasswordToken)
                    setEmail(response.data.email)
                    alert(response.data.message)
                    setresetPass(true)
                } catch (error: any) {
                    alert(error.response.data.error)
                }
        }
    })()
    },[])

    if (resetPass) {
      return (
        <div className="bg-gray-300 h-screen w-screen flex justify-center items-center" >
          <div className="bg-white h-[325px] w-[500px] flex flex-col shadow-2xl rounded-lg gap-4" >
            <div className="text-4xl font-bold text-center p-4" >
              Reset Password
            </div>
            <div className="flex justify-center">
            <div className="w-[80%]" >
            <div className="flex flex-col" >
              <label className="font-medium text-sky-600" >New Password</label>
              <input className="border border-slate-300 rounded-lg p-1.5" type="text" placeholder="*****"
              value={postInputs.password} onChange={(e) => {setpostInputs({
                ...postInputs,
                confirmpassword: e.target.value
              })}}></input>
            </div>
            <div className="flex flex-col mt-4"  >
              <div className="font-medium text-sky-600" >Confirm New Password</div>
              <input className="border border-slate-300 rounded-lg p-1.5" type="text" placeholder="*****" 
              value={postInputs.confirmpassword} onChange={(e) => setpostInputs({
                ...postInputs,
                confirmpassword: e.target.value
              })}></input>
            </div>
            </div>
            </div>
            <div className="flex justify-center" >
              <button className="bg-sky-600 w-[80%] p-2 mt-2 text-white rounded hover:bg-sky-700" 
              onClick={async () => {
                try {
                  const response = await AuthService.resetpassword(postInputs)
                  alert(response.data.message)
                  navigate("/signin")
                } catch (error: any) {
                  console.error(error)
                  alert(error.response.data.error)
                }
              }}>SUBMIT </button>
            </div>
          </div>
       </div>
      )
    }


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
                  } catch (error: any) {
                    console.error(error)
                    alert(error.response.data.error)
                  }
                }} className="bg-sky-600 w-[80%] p-2 mt-2 text-white rounded">Send Reset Link</button>
            </div>
    </div>
  )
}

export default Password
