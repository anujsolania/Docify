import { useEffect, useRef, useState } from "react"
import image from "../assets/logo.png"
import AuthService from "../services/user-service"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store/zustand"

const DocumentNavbar = () => {
  const[name,setName] = useState("")
  const[position,setPosition] = useState({top:0, left:0})
  const[isOpen,setisOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setDocuments = useStore((state) => state.setDocuments)
  const getDocuments = useStore((state) => state.getDocuments)

  const navigate = useNavigate()

  const token = sessionStorage.getItem("token") as string
  
  useEffect(() => {
   (async () => {
    try {
      if (!token) return alert("Token is missingggg");
      const response = await AuthService.getuser(token)
      setName(response.data.username)
    } catch (error: any) {
      console.error(error)
      alert(error.response.data.error)
    }
    })()
  },[])

  const filterDocuments = async (filter: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    if (filter === "") {
      getDocuments()
    } else {
      try {

        debounce.current = setTimeout(async () => {
          const response = await AuthService.filterdocuments({filter,token})
          setDocuments(response.data.filtereddocuments)
        }, 300);
      } catch (error: any) {
        console.error(error)
        alert(error.response.data.error)
      }
    }
  }

  const handlePosition = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      top: rect.bottom +  window.scrollY,
      left: rect.left + window.scrollX + (-50)
    })
    setisOpen(!isOpen)
  }

  const logout = () => {
    sessionStorage.clear()
    navigate("/signin")

  }

  return (
    <div className="w-screen h-[50px] bg-white flex items-center justify-between p-10">
        <div className="flex gap-4" >
            <img src={image} className="h-12 w-10 m-auto" ></img>
            <div className="p-2" >
                <input className="" placeholder="Unititled document" ></input>
                <div className="flex gap-1" >
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >File</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5">Edit</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >View</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >Insert</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >Format</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >Tools</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >Add-ons</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >Help</button>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-10">
            <button className="bg-blue-600 rounded-full px-6 text-white">Share</button>
            <button className="bg-blue-400 h-10 w-10 rounded-full text-white text-2xl m-auto" 
            onClick={(e) => {handlePosition(e)}}>{name[0]}</button>
        </div>
        { 
          isOpen && (
                <div className="absolute  bg-white border border-gray-300 rounded" style={{top: position.top, left: position.left}}>
                    <p className="hover:bg-gray-100 p-1.5" onClick={logout} >Logout</p>
                </div>
          )
        }
    </div>
  )
}

export default DocumentNavbar
