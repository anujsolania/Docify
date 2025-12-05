
import { useEffect } from "react";
import QuillEditor from "../components/QuillEditor";
import AuthService from "../services/user-service";
import { useParams } from "react-router-dom";
import { useStore } from "../store/zustand";
import DocumentNavbar from "../components/DocumentNavbar";


const Document = () => {

  const token = useStore((state) => state.token)
  const {documentId} = useParams()
  const numericdocumentId = Number(documentId)

  const setContent = useStore((state) => state.setContent)
  const setTitle = useStore((state) => state.setTitle)
  const setPermissionOfuser = useStore((state) => state.setPermissionOfuser)

  useEffect(() => {
    const getdocumentone = async () => {
      try {
        const response = await AuthService.getdocumentone(token!,numericdocumentId)
        setContent(response.data.document.content ?? "")
        setTitle(response.data.document.title ?? "Untitled document")
        console.log("PERMISSION FROM BACKEND:",response.data.permission)
        setPermissionOfuser(response.data.permission)
      } catch (error) {
        console.error(error)
        alert("Error while getdocumentone data")
      }
    }
    getdocumentone()

    return () => {
      setContent("")
      setTitle("")
    }
  },[])

  return (
     <div className="bg-gray-300 min-h-screen w-screen flex flex-col" >
      <DocumentNavbar/>
      <div className="grow mx-10 sm:mx-20 md:mx-30 lg:mx-40 xl:mx-60 2xl:mx-80 border border-gray-400 bg-white shadow-2xl" >
      <QuillEditor></QuillEditor>
      </div>
    </div>
  )
}

export default Document
