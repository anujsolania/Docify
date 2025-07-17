import { useNavigate } from "react-router-dom"
import type { Document } from "../interfaces/interfaces"
import image from "../assets/logo.png"

const Documents = ({documents}: {documents: Document[]}) => {
    const navigate = useNavigate()

  return (
    <div className="flex flex-wrap gap-8"  >
        {
            documents.map((doc) => (
                <div key={doc.id} className="h-[250px] w-[180px] bg-white flex flex-col border border-gray-400 hover:shadow-xl" onClick={()=> navigate(`/document/${doc.id}`)}>
                    <div className="h-[180px] border-b border-b-gray-400 p-2" >
                    <p>Content</p>
                    </div>
                    <div className="flex flex-col gap-1 p-3" >
                        <div className="text-sm " >Untitled Document</div>
                        <div className="flex gap-3" >
                        <img src={image} className="h-6 m-auto" ></img>
                        <p className="text-sm text-gray-600 font-extralight m-auto" >05 June 2026</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical h-10 w-6 text-gray-500" viewBox="0 0 16 16">
                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                        </div>
                    </div>
                </div>
            ))
        }
    </div>
  )
}

export default Documents
