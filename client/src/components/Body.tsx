import { useEffect, useState } from "react"
import AuthService from "../services/user-service"
import type { Document } from "../interfaces/interfaces"
import Documents from "./Documents"

const Body = () => {
  const[documents,setDocuments] = useState<Document[]>([])


    const getdocs = async () => {
      try {
        const response = await AuthService.getdocuments(sessionStorage.getItem("token") as string)
        setDocuments(response.data.documents)
      } catch (error: any) {
        console.error(error)
        alert(error.response.data.error)
      }
    }

  useEffect(() => {
    getdocs()
  },[])

  const createdocument = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return alert("User is not authenticated");
      const response = await AuthService.createdocument(token)
      alert(response.data.message)
      getdocs()
      // navigate(`/document/${response.data.document.id}`)
    } catch (error: any) {
      console.error(error)
      alert(error.response.data.error)
    }
  }


  return (
        <div className="flex flex-col gap-6 px-10 md:px-20 lg:px-32 xl:px-40 py-10" >
        <div className="h-[200px] w-full" >
          <button className="h-full w-[150px] bg-white shadow-2xl text-sm flex flex-col justify-center items-center"
          onClick={createdocument} >
            <p className="text-9xl font-extralight text-blue-500">+</p>
            <p className="" >Blank</p>
          </button>
        </div>
        <div className="" >
          <p className="text-lg font-semibold" >Recent Documents</p>
        </div>
        <Documents documents={documents} getdocs={getdocs} ></Documents>
      </div>
  )
}

export default Body
