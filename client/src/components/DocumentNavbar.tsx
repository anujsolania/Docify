import { useEffect, useRef, useState } from "react"
import image from "../assets/logo.png"
import AuthService from "../services/user-service"
import { useStore } from "../store/zustand"
import { useNavigate, useParams } from "react-router-dom"
import ShowShare from "./ShowShare"


const DocumentNavbar = () => {
  const[name,setName] = useState("")
//   const[position,setPosition] = useState({top:0, left:0})
//   const[isOpen,setisOpen] = useState(false)
const debounce = useRef<ReturnType<typeof setTimeout> | null> (null)

const showShare = useStore((state) => state.showShare)
const setshowShare = useStore((state) => state.setshowShare)
// const[email,setEmail] = useState("")
// const[permission,setPermission] = useState("")

const title = useStore((state) => state.title)
const setTitle = useStore((state) => state.setTitle)

const {documentId} = useParams()
const numericdocumentId = Number(documentId)

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

  const dataTobackend = async () => {
    if (debounce.current) clearTimeout(debounce.current)
    try {
        debounce.current = setTimeout(() => {
           (async () => {
                await AuthService.updatedocument(token,{numericdocumentId,title})
            })()
        }, 1000)
    } catch (error) {
        console.error(error)
        alert("Error while updating title")
    }
  }

// const sharedocument = async () => {
//   try {
//     const response = await AuthService.sharedocument(token,numericdocumentId,email,permission)
//     alert(response.data.message)
//     setshowShare(!showShare)
//   } catch (error: any) {
//     console.error(error)
//     alert(error.response.data.error)
//   }
// }

  return (
    <div className="w-screen h-[50px] bg-white flex items-center justify-between p-10">
        <div className="flex gap-4" >
            <img src={image} onClick={() => navigate("/")} className="h-12 w-10 m-auto" ></img>
            <div className="p-2 flex flex-col gap-1" >
                <input placeholder="Unititled document" value={title} onChange={(e) => {
                    setTitle(e.target.value)
                    dataTobackend()
                }} ></input>
                <div className="flex gap-1" >
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >File</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5">Edit</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >View</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >Insert</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5 hidden md:inline" >Format</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5 hidden md:inline" >Tools</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5 hidden md:inline" >Add-ons</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5 hidden md:inline" >Help</button>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-1 sm:gap-4 lg:gap-6" >
            <button className="bg-blue-600 rounded-full px-6 text-white" onClick={() => setshowShare(true)} >Share</button>
            <button className="bg-blue-400 h-10 w-10 rounded-full text-white text-2xl m-auto border border-blue-600">{name[0]}</button>
        </div>
        { 
          showShare && (<ShowShare numericdocumentId={numericdocumentId} />)
        }
    </div>
  )
}

export default DocumentNavbar
