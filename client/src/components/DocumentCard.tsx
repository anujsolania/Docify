// import { useNavigate } from "react-router-dom"
import image from "../assets/logo.png"
import { useEffect, useState } from "react"
import AuthService from "../services/user-service"
import { useStore } from "../store/zustand"
import { useNavigate } from "react-router-dom"

const DocumentCard = () => {
    const [position,setPosition] = useState({top:0, left:0})
    const [isOpen,setisOpen] = useState(false)
    const[sendData,setsendData] = useState({
        documentId: 0,
        token: ""
    })
    const navigate = useNavigate()

    useEffect(() => {
        getDocuments()
    },[])

  
    const getDocuments = useStore((state) => state.getDocuments)
    const documents = useStore((state) => state.documents)
    const setContent = useStore((state) => state.setContent)


    const handlePosition = (e: React.MouseEvent, docId: number) => {
        const rect = e.currentTarget.getBoundingClientRect()
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            })
            setisOpen(!isOpen)
            setsendData({
                documentId: docId,
                token: sessionStorage.getItem("token") as string
            })
    }

    const deletedocument = async () => {
    try {
      setisOpen(!isOpen)
      const token = sessionStorage.getItem("token");
      if (!token) return alert("Token is missingggg");
      const response = await AuthService.deletedocument(sendData)
      alert(response.data.message)
      getDocuments()
      // navigate(`/document/${response.data.document.id}`)
    } catch (error: any) {
      console.error(error)
      alert(error.response.data.error)
    }
  }

  function stripHtml(html: string) {
    const tempdiv = document.createElement("div")
    tempdiv.innerHTML = html
    return tempdiv.innerText
  }

  return (
    <div className="flex flex-wrap gap-8"  >
        {
            documents.map((doc) => (
                <div key={doc.id} className="h-[250px] w-[180px] bg-white flex flex-col border border-gray-400 hover:shadow-xl rounded">
                    <div className="h-[200px] border-b border-b-gray-400 p-2 " 
                    onClick={() =>{
                    setContent(doc.content || "") 
                    navigate(`/document/${doc.id}`)
                    }} >
                    <p className="text-[3px]" >{stripHtml(doc.content || "")}</p>
                    </div>
                    <div className="flex flex-col gap-3 p-3" >
                        <div className="text-sm h-[10px]" >{doc.title || "Untitled document"}</div>
                        <div className="flex gap-3" >
                        <img src={image} className="h-6 m-auto" ></img>
                        <p className="text-sm text-gray-600 font-extralight m-auto" >05 June 2026</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical h-10 w-6 text-gray-500" viewBox="0 0 16 16"
                        onClick={(e) => {handlePosition(e,doc.id)} }>
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                        </div>
                    </div>
                </div>
            ))
        }
        {
            isOpen && (
                <div className="absolute  bg-white border border-gray-300 rounded" style={{top: position.top, left: position.left}}>
                    <p className="border-b border-b-gray-300 hover:bg-gray-100 p-1.5" 
                    onClick={deletedocument}>Delete</p>
                    <p className="hover:bg-gray-100 p-1.5">Share</p>
                </div>
            )
        }
    </div>
  )
}

export default DocumentCard
