import { useEffect, useRef, useState } from "react"
import image from "../assets/logo.png"
import AuthService from "../services/user-service"
import { useStore } from "../store/zustand"
import { useNavigate, useParams } from "react-router-dom"
import ShowShare from "./ShowShare"
import { jwtDecode } from "jwt-decode"
import type { TokenPayload } from '../interfaces/interfaces'
import ActiveUsersDiv from "../store/ActiveUsersDiv"
import { io, Socket } from "socket.io-client"


const DocumentNavbar = () => {
  const[name,setName] = useState("")
//   const[position,setPosition] = useState({top:0, left:0})
//   const[isOpen,setisOpen] = useState(false)
const debounce = useRef<ReturnType<typeof setTimeout> | null> (null)
const socketRef = useRef<Socket | null>(null)

 const permissionOfuser = useStore((state) => state.permissionOfuser)

const showShare = useStore((state) => state.showShare)
const setshowShare = useStore((state) => state.setshowShare)
// const[email,setEmail] = useState("")
// const[permission,setPermission] = useState("")

const title = useStore((state) => state.title)
const setTitle = useStore((state) => state.setTitle)

const editingTitle = useStore((state) => state.editingTitle)
const setEditingTitle = useStore((state) => state.setEditingTitle)

const activeUsers = useStore((state) => state.activeUsers)

const [showActiveUsersPopUp,setShowActiveUsersPopUp] = useState(false)
const triggerRef = useRef<HTMLDivElement | null>(null)

const {documentId} = useParams()
const numericdocumentId = Number(documentId)

const navigate = useNavigate()

const token = useStore((state) => state.token)
const decodedToken: TokenPayload = jwtDecode(token!)

// Filter out current user from active users
const otherUsers = activeUsers.filter(user => user.userId !== decodedToken.id)
  
  useEffect(() => {
   (async () => {
    try {
      const response = await AuthService.getuser(token!)
      setName(response.data.username)
    } catch (error: any) {
      console.error(error)
      alert(error.response.data.error)
    }
    })()
  },[])

  // Socket setup for real-time title
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_URL, {
      auth: {
        token: token,
        documentId: documentId
      }
    })

    const socket = socketRef.current

    socket.on("connect", () => {
      console.log("Title socket connected:", socket.id)
    })

    // Receive title changes from other users
    socket.on("receive-title-change", (newTitle: string) => {
      setTitle(newTitle)
    })

    // Receive title editing status
    socket.on("title-edit-start", (user: { userId: number; userEmail: string }) => {
      if (user.userId !== decodedToken.id) {
        setEditingTitle(user)
      }
    })

    socket.on("title-edit-end", () => {
      setEditingTitle(null)
    })

    return () => {
      socket.off("receive-title-change")
      socket.off("title-edit-start")
      socket.off("title-edit-end")
      socket.disconnect()
      setEditingTitle(null)
    }
  }, [documentId, token])

  const dataTobackend = async (newTitle: string) => {
    if (permissionOfuser === "VIEW") return;
    
    // Emit to other users immediately (real-time)
    if (socketRef.current) {
      socketRef.current.emit("title-change", newTitle)
    }
    
    // Debounced save to DB
    if (debounce.current) clearTimeout(debounce.current)
    try {
        debounce.current = setTimeout(() => {
           (async () => {
                await AuthService.updatedocument(token!,{numericdocumentId,title: newTitle})
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
                <div className="relative">
                    <input 
                        placeholder="Unititled document" 
                        value={title} 
                        disabled={permissionOfuser === "VIEW"}
                        onFocus={() => {
                            if (permissionOfuser !== "VIEW" && socketRef.current) {
                                socketRef.current.emit("title-edit-start", {
                                    userId: decodedToken.id,
                                    userEmail: decodedToken.email
                                })
                            }
                        }}
                        onBlur={() => {
                            if (socketRef.current) {
                                socketRef.current.emit("title-edit-end")
                            }
                        }}
                        onChange={(e) => {
                            const newTitle = e.target.value
                            setTitle(newTitle)
                            dataTobackend(newTitle)
                        }} 
                    ></input>
                    {editingTitle && editingTitle.userId !== decodedToken.id && (
                        <div className="absolute -bottom-5 bg-gray-200 p-0.5 left-0 text-xs text-blue-600 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            {editingTitle.userEmail} is editing the title
                        </div>
                    )}
                </div>
                <div className="flex gap-1" >
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >File</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5">Edit</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >View</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5" >Insert</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5 hidden md:inline" >Format</button>
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5 hidden md:inline" >Tools</button>
                    {/* <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5 hidden md:inline" >Add-ons</button> */}
                    <button className="hover:bg-gray-100 rounded-lg text-sm font-medium p-1.5 hidden md:inline" >Help</button>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-1 sm:gap-4 lg:gap-6" >
          <div className="flex gap-2" >
            {/* for larger screens */}
            <div
            ref={triggerRef}
            onClick={() => setShowActiveUsersPopUp(!showActiveUsersPopUp)}
            className="hidden sm:flex gap-2" >
          {otherUsers?.map((user) => {
              return (
              <button 
              key={user.clientId} 
              title={user.userEmail}
              style={{ backgroundColor: user.color }}
              className="h-9 w-9 rounded-full text-white text-xl m-auto border border-blue-600">{user.userEmail[0]}</button>
              )
            })}
            </div>
            {/* for smaller screens */}
            {showActiveUsersPopUp ?
            (
              <>
            <div className="flex sm:hidden items-center" >
              <button 
              onClick={() => setShowActiveUsersPopUp(!showActiveUsersPopUp)}
              className="h-9 w-9 rounded-full bg-gray-300 text-2xl font-extralight">
              <div className="mt-1.5" >^</div>
              </button>
            </div>
            <ActiveUsersDiv otherUsers={otherUsers} setShowActiveUsersPopUp={setShowActiveUsersPopUp} triggerRef={triggerRef} />
            </>
            ) :
            (otherUsers.length > 0 && <div className="flex sm:hidden items-center" >
              <button
              title={String(otherUsers.length > 1 ? otherUsers.length + " viewers" : otherUsers.length + " viewer")}
              onClick={() => setShowActiveUsersPopUp(!showActiveUsersPopUp)}
              className="h-9 w-9 rounded-full bg-gray-300 text-sm border border-blue-600">
                {otherUsers.length}
              </button>
            </div>)
            }
          </div>
          <div className="flex gap-1" >
            <button className="bg-blue-600 rounded-full h-full px-6 text-white" onClick={() => setshowShare(true)} >Share</button>
            <button className="bg-blue-400 h-10 w-10 rounded-full text-white text-2xl m-auto border border-blue-600">{name[0]}</button>
          </div>
        </div>
        { 
          showShare && (<ShowShare numericdocumentId={numericdocumentId} />)
        }
    </div>
  )
}

export default DocumentNavbar
