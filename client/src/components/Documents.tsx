import { useNavigate } from "react-router-dom"
import type { Document } from "../interfaces/interfaces"

const Documents = ({documents}: {documents: Document[]}) => {
    const navigate = useNavigate()

  return (
    <div className="flex flex-wrap gap-8"  >
        {
            documents.map((doc) => (
                <div key={doc.id} className="h-[250px] w-[150px] bg-white" onClick={()=> navigate(`/document/${doc.id}`)}>
                    <p className="text-sm" >{doc.title}</p>
                    <p>{doc.content}</p>
                </div>
            ))
        }
    </div>
  )
}

export default Documents
