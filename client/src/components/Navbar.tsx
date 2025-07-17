import { useEffect, useState } from "react"
import image from "../assets/logo.png"
import AuthService from "../services/user-service"

const Navbar = () => {
  const[name,setName] = useState("")
  
  useEffect(() => {
   (async () => {
    try {
      const response = await AuthService.getuser(sessionStorage.getItem("token") as string)
      setName(response.data.username)
    } catch (error: any) {
      console.error(error)
      alert(error.response.data.error)
    }
    })()
  },[])

  return (
    <div className="w-screen h-[50px] bg-white flex items-center justify-between p-10">
        <div className="flex gap-4" >
            <img src={image} className="h-10 w-8 m-auto" ></img>
            <h1 className="text-2xl font-semibold m-auto" >Docify </h1>
        </div>
        <div className="flex justify-end gap-10">
            <input className="bg-gray-300 rounded-lg p-5 h-8 w-52" placeholder="Search documents..." ></input>
            <button className="bg-blue-400 h-10 w-10 rounded-full text-white text-2xl m-auto" >{name[0]}</button>
        </div>
    </div>
  )
}

export default Navbar
