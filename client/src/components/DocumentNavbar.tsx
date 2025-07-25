import { useEffect, useRef, useState } from "react"
import image from "../assets/logo.png"
import AuthService from "../services/user-service"
import { useStore } from "../store/zustand"
import { useParams } from "react-router-dom"


const DocumentNavbar = () => {
  const[name,setName] = useState("")
//   const[position,setPosition] = useState({top:0, left:0})
//   const[isOpen,setisOpen] = useState(false)
const debounce = useRef<ReturnType<typeof setTimeout> | null> (null)
const[showShare,setshowShare] = useState(false)

const[email,setEmail] = useState("")
const[permission,setPermission] = useState("")

const title = useStore((state) => state.title)
const setTitle = useStore((state) => state.setTitle)

const {documentId} = useParams()
const numericdocumentId = Number(documentId)

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

//   const handlePosition = (e: React.MouseEvent) => {
//     const rect = e.currentTarget.getBoundingClientRect()
//     setPosition({
//       top: rect.bottom +  window.scrollY,
//       left: rect.left + window.scrollX + (-50)
//     })
//     setisOpen(!isOpen)
//   }
const sharedocument = async () => {
  try {
    const response = await AuthService.sharedocument(token,numericdocumentId,email,permission)
    alert(response.data.message)
    setshowShare(!showShare)
  } catch (error: any) {
    console.error(error)
    alert(error.response.data.error)
  }
}

  return (
    <div className="w-screen h-[50px] bg-white flex items-center justify-between p-10">
        <div className="flex gap-4" >
            <img src={image} className="h-12 w-10 m-auto" ></img>
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
        <div className="flex justify-end gap-10">
            <button className="bg-blue-600 rounded-full px-6 text-white" onClick={() => setshowShare(true)} >Share</button>
            <button className="bg-blue-400 h-10 w-10 rounded-full text-white text-2xl m-auto border border-blue-600">{name[0]}</button>
        </div>
        { 
          showShare && (
              <div className="fixed inset-0 flex items-center justify-center  bg-gray-700/50 z-10">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col min-h-[400px] w-[70%] sm:w-[50%] lg:w-[40%] gap-6">
                 <p className="text-lg font-semibold" >Share Document</p>
                 <div>
                  <p className="" >Email:</p>
                  <input className="border border-gray-300 rounded w-full p-1" value={email} onChange={(e) => setEmail(e.target.value)} ></input>
                 </div>
                 <div>
                  <p>Collaborators:</p>
                  <button className="bg-gray-100 h-[30px] rounded w-full p-1 shadow" ></button>
                 </div>
                 <div>
                  <p>Permission:</p>
                  <select className="w-full p-1 border border-gray-300 rounded" 
                  value={permission} onChange={(e) => setPermission(e.target.value)}>
                    <option value="" >Select permission</option>
                    <option value="VIEW" >VIEW</option>
                    <option value="EDIT">EDIT</option>
                  </select>
                  <div className="flex justify-end gap-2 mt-5" >
                    <button className="p-2 rounded border border-gray-300" onClick={() => setshowShare(!showShare)} >Cancel</button>
                    <button className="bg-sky-600 p-2 rounded text-white"
                    onClick={sharedocument} >Share</button>
                  </div>
                 </div>
                </div>
              </div>
          )
        }
    </div>
  )
}

export default DocumentNavbar
