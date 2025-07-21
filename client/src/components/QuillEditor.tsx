
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";
import "../css/quill.css"
import { useStore } from '../store/zustand';
import AuthService from '../services/user-service';
import { useParams } from 'react-router-dom';

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

  const {documentId} = useParams()
  const numericdocumentId = Number(documentId)
  const token = sessionStorage.getItem("token") as string

  const content = useStore((state) => state.content)
  const setContent = useStore((state) => state.setContent)


  useEffect(() => {
    if (!divRef.current) return
    if (!quillRef.current) {
      quillRef.current = new Quill(divRef.current,{theme: "snow",modules: {toolbar: toolbarOptions}})
    }

  const dataTobackend = () => {
    if (debounce.current) clearTimeout(debounce.current)
    try {
      debounce.current = setTimeout(() => {
        (async () => {
        const html = quillRef.current?.root.innerHTML || ""
        setContent(html)
        await AuthService.updatecontent(token, {numericdocumentId,content:html}) as any 
        })()
      },1000)
    } catch (error) {
      console.error(error)
      alert("error while sending data to backend")
    }
  }
    quillRef.current.on("text-change",dataTobackend)

    return () => {
      if (quillRef.current) {
        quillRef.current.off("text-change",dataTobackend)
      }
    }
  },[])

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const response = await AuthService.getdocumentone(token,numericdocumentId)

  //       if (quillRef.current) {
  //         quillRef.current.root.innerHTML = response.data.document.content as string
  //       }

  //     } catch (error) {
  //       alert("Failed to load document content")
  //       console.error("Failed to load document:", error)
  //     }
  //   })()
  // },[])

  useEffect(() => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = content
      }
  },[])

  

  return (
    <div ref={divRef} ></div>
  )
}

export default QuillEditor
