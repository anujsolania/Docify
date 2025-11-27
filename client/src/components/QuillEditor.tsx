
import Quill, { Delta } from 'quill';
import "quill/dist/quill.snow.css";
import { use, useEffect, useRef, useState } from "react";
import "../css/quill.css"
import { useStore } from '../store/zustand';
import AuthService from '../services/user-service';
import { useParams } from 'react-router-dom';
import { io, Socket } from "socket.io-client"
import { jwtDecode } from "jwt-decode";
import QuillCursors from 'quill-cursors';
import type { TokenPayload } from '../interfaces/interfaces';
import { getColorForUser, releaseColorForUser } from '../store/colorLogic';
Quill.register('modules/cursors', QuillCursors);

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
  const decodedToken: TokenPayload = jwtDecode(token)

  const content = useStore((state) => state.content)

  const activeUsers = useStore((state) => state.activeUsers)
  const setActiveUsers = useStore((state) => state.setActiveUsers)

  const dataTobackend = () => {
    if (debounce.current) clearTimeout(debounce.current)
    try {
      debounce.current = setTimeout(() => {
        (async () => {
        const html = quillRef.current?.root.innerHTML as string
        await AuthService.updatedocument(token, {numericdocumentId,content:html}) as any 
        })()
      },1000)
    } catch (error) {
      console.error(error)
      alert("error while sending data to backend")
    }
  }



  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = new Quill(divRef.current!,{
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
          cursors: true,
          // cursors: {
          // transformOnTextChange: true
        // }
        }})
    }

    const socketServer = io("http://localhost:3000",{
      query: {
        token: token,
        documentId: documentId
      }
    })

    socketServer.on("connect", () => {
    console.log("Connected to server! Socket ID:", socketServer.id)
    })

    //get cursor instance
    const cursors = quillRef.current.getModule("cursors");

    const handleChange = (delta: Delta,oldDelta: Delta, source: string) => {
      if (source !== "user") return
      socketServer.emit("send-changes",delta)
      dataTobackend()
    }

    //send changes
    quillRef.current.on("text-change",handleChange)

    const receiveChange = (delta: Delta) => {
      quillRef.current!.updateContents(delta)
    }
    //receive changes
    socketServer.on("receive-changes",receiveChange)

    const handleSelectionChange = (range: unknown,oldRange: unknown,source: string) => {
      // if (source !== "user" || !range) return
      socketServer.emit("cursor-change",{
        // userId: AuthService.getCurrentUser().id,
        // username: AuthService.getCurrentUser().username
        userId: decodedToken.id,
        userEmail: decodedToken.email,
        range
      })
    }

    //send cursor changes
    quillRef.current.on("selection-change", handleSelectionChange)

    //receive cursor changes
    socketServer.on("cursor-update",({ userId, userEmail, range }) => {
      if (range === null) {
        cursors.removeCursor(userId)
        return
      }
      if (!cursors.cursors[userId]) {
        const userColor = getColorForUser(userId);
        cursors.createCursor(userId, userEmail, userColor)
      }
      cursors.moveCursor(userId, range)
    })

    //send user that joined
    socketServer.emit("join-document", {
      userId: decodedToken.id,
      userEmail: decodedToken.email
    })

    //receive user that joined
    socketServer.on("user-joined", (newUser) => {
      setActiveUsers((prev) => {
        // Check if user already exists
        const userExists = prev.some(user => user.userId === newUser.userId);
        if (userExists) {
          return prev;
        }
        return [...prev, newUser];
      });
    });

    //remove user that disconnected
    socketServer.on("user-disconnected", (leftUser: { userId: number; userEmail: string }) => {
      setActiveUsers((prev) => prev.filter(user => user.userId !== leftUser.userId));
    });

    return () => {
      quillRef.current?.off("text-change",dataTobackend)
      socketServer.off("receive-changes",receiveChange)
      socketServer.off("user-joined")
      socketServer.off("user-disconnected")
      socketServer.disconnect()
      releaseColorForUser(String(decodedToken.id));
      debounce.current && clearTimeout(debounce.current)
      // Clear active users when component unmounts
      setActiveUsers([]);
    }
  },[])

  useEffect(() => {
    if (quillRef.current) {
        quillRef.current.clipboard.dangerouslyPasteHTML(content)
    }
  },[content])


  return (
    <div ref={divRef} ></div>
  )
}

export default QuillEditor

