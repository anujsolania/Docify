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
        <div className="h-screen w-screen flex flex-col justify-center items-center" >
        <p>Your email has been verified successfully</p>
        <Link to={"/signin"}>GO TO SIGNIN PAGE</Link>
        </div>
        )
    }

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center" >
        <p>Your email verification link has been sent to your mail box</p>
        <a href="https://gmail.com" className="bg-amber-200">GO TO YOUR MAILBOX</a>
    </div>
  )
}

export default Verify
