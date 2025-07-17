import { useNavigate } from "react-router-dom"
import type { Document } from "../interfaces/interfaces"
import image from "../assets/logo.png"

const Documents = ({documents}: {documents: Document[]}) => {
    const navigate = useNavigate()

  return (
    <div className="flex flex-wrap gap-8"  >
        {
            documents.map((doc) => (
                <div key={doc.id} className="h-[250px] w-[150px] bg-white flex flex-col" onClick={()=> navigate(`/document/${doc.id}`)}>
                    <div className="bg-amber-600 h-[180px]" >
                    <p>Content</p>
                    </div>
                    <div className="flex flex-col gap-1 p-3" >
                        <div className="text-sm" >Untitled Document</div>
                        <div className="flex gap-3" >
                        <img src={image} className="h-6 m-auto" ></img>
                        <p className="text-sm" >05 June 2026</p>
                        <svg width="20px" height="20px" viewBox="0 0 24 24" id="three-dots" xmlns="http://www.w3.org/2000/svg">
                       <g id="_20x20_three-dots--grey" data-name="20x20/three-dots--grey" transform="translate(24) rotate(90)">
                      <rect id="Rectangle" width="24" height="24" fill="none" />
                      <circle id="Oval" cx="1" cy="1" r="1" transform="translate(5 11)" stroke="#000000" strokeMiterlimit="10" strokeWidth="0.5" />
                      <circle id="Oval-2" data-name="Oval" cx="1" cy="1" r="1" transform="translate(11 11)" stroke="#000000" strokeMiterlimit="10" strokeWidth="0.5" />
                      <circle id="Oval-3" data-name="Oval" cx="1" cy="1" r="1" transform="translate(17 11)" stroke="#000000" strokeMiterlimit="10" strokeWidth="0.5" />
                      </g>
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
