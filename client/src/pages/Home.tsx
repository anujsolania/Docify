import { useEffect } from "react"
import Body from "../components/Body"
import Navbar from "../components/Navbar"


const Home = () => {
  const token = sessionStorage.getItem("token")

  useEffect(() => {
    
  },[])


  return (
    <div className="bg-gray-300 min-h-screen w-screen" >
      <Navbar/>
      <div className="" >
      <Body></Body>
      </div>
      <div className="bg-[#50A2FF] font-serif text-center p-2" >
        © 2025 Docify. All rights Reserved
      </div>
    </div>
  )
}

export default Home
