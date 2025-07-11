import { useState } from "react"

function Password() {
    const [email,setEmail] = useState("")
  return (
    <div>
        <h1>Forgot Password?</h1>
        <p>Please enter your linked email address</p>
        <input type="text" placeholder="abc@gamil.com"></input>
        <button onClick={async () => {

        }} >Send Reset Link</button>

    </div>
  )
}

export default Password
