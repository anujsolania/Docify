import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import AuthService from "../services/user-service"

function Verify() {
    const { verificationToken } = useParams()
    const [Verified,setVerified] = useState(false)

    useEffect(() => {
        const verifyemail = async () => {
            if (verificationToken) {
                try {
                    const response = await AuthService.verifyemail(verificationToken)
                    alert(response.data.message)
                    setVerified(response.data.verified)
                } catch (error: any) {
                    alert(error.response.data.error)
                }
        }
    }
    verifyemail()
    },[])

    if (Verified) {
        return (
        <div className="h-screen w-screen flex flex-col justify-center items-center gap-6" >
        <h1 className="text-5xl font-bold" >Email Verified</h1>
        <div >
         <p className="text-gray-500 text-lg w-[480px] sm:w-[550px] text-center " >Your email has been successfully verified.</p>
        <p className="text-gray-500 text-lg w-[480px] sm:w-[550px] text-center mt-2"  >You can now proceed to login.</p>
        </div>
        <Link to={"/signin"} className="w-[350px] hover:bg-sky-700 bg-sky-600 rounded p-2.5 text-white text-center">Go to Login page</Link>
        </div>
        )
    }

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center gap-6" >
        <h1 className="text-5xl font-bold" >Check your inbox</h1>
        <p className="text-gray-500 text-lg w-[480px] sm:w-[550px] text-center" >We are glad, that you’re with us ? We’ve sent you a verification link to your email address.</p>
        <a href="https://gmail.com" className="w-[300px] hover:bg-sky-700 bg-sky-600 rounded p-2.5 text-white text-center">Open Your Mail</a>
    </div>
  )
}

export default Verify
