
import Quill, { Delta } from 'quill';
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
import "../css/quill.css"
import { useStore } from '../store/zustand';
import AuthService from '../services/user-service';
import { useParams } from 'react-router-dom';
import { io, Socket } from "socket.io-client"

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  [{ 'direction': 'rtl' }],                         // text direction

  [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'font': [] }],
  [{ 'align': [] }],

  ['clean']                                         // remove formatting button
];




const QuillEditor = () => {
  const divRef = useRef<HTMLDivElement | null>(null)
  const quillRef = useRef<Quill | null>(null)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const[quill,setQuill] = useState<Quill | null>()
  const[socket,setSocket] = useState<Socket | null >()

  const {documentId} = useParams()
  const numericdocumentId = Number(documentId)
  const token = sessionStorage.getItem("token") as string

  const content = useStore((state) => state.content)

  // const dataTobackend = () => {
  //   if (debounce.current) clearTimeout(debounce.current)
  //   try {
  //     debounce.current = setTimeout(() => {
  //       (async () => {
  //       const html = quillRef.current?.root.innerHTML as string
  //       await AuthService.updatedocument(token, {numericdocumentId,content:html}) as any 
  //       })()
  //     },1000)
  //   } catch (error) {
  //     console.error(error)
  //     alert("error while sending data to backend")
  //   }
  // }



  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = new Quill(divRef.current!,{theme: "snow",modules: {toolbar: toolbarOptions}})
    }

    const socketServer = io("http://localhost:3000",{
      query: {
        token: token,
        documentId: documentId
      }
    })

    const handleChange = (delta: Delta,oldDelta: Delta, source: string) => {
      if (source !== "user") return
      socketServer.emit("send-changes",delta)
    }

    //send changes
    quillRef.current.on("text-change",handleChange)

    const receiveChange = (delta: Delta) => {
      quillRef.current!.updateContents(delta)
    }
    //receive changes
    socketServer.on("receive-changes",receiveChange)

    return () => {
      quillRef.current?.off("text-change",handleChange)
      socketServer.off("receive-changes",receiveChange)
      socketServer.disconnect()

    }
  },[])

  // useEffect(() => {
  //   if (quillRef.current) {
  //       quillRef.current.root.innerHTML = content
  //   }
  // },[content])

  return (
    <div ref={divRef} ></div>
  )
}

export default QuillEditor
