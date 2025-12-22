
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";
import "../css/quill.css"
import { useStore } from '../store/zustand';
import AuthService from '../services/user-service';
import { useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import QuillCursors from 'quill-cursors';
import type { TokenPayload } from '../interfaces/interfaces';
import { getColorForUser, releaseColorForUser } from '../store/colorLogic';
// Yjs imports for CRDT-based collaborative editing
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebsocketProvider } from 'y-websocket';
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
  // Yjs refs - shared document and WebSocket provider
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const bindingRef = useRef<QuillBinding | null>(null)

  const {documentId} = useParams()
  const numericdocumentId = Number(documentId)
  const token = useStore((state) => state.token)
  const decodedToken: TokenPayload = jwtDecode(token!)

  const content = useStore((state) => state.content)

  const setActiveUsers = useStore((state) => state.setActiveUsers)

  const permissionOfuser = useStore((state) => state.permissionOfuser)

  // Save document to backend database periodically
  const dataTobackend = () => {
    if (debounce.current) clearTimeout(debounce.current)
    try {
      debounce.current = setTimeout(() => {
        (async () => {
        const html = quillRef.current?.root.innerHTML as string
        await AuthService.updatedocument(token!, {numericdocumentId,content:html}) as any 
        })()
      },2000) // Increased to 2s since Yjs handles real-time sync
    } catch (error) {
      console.error(error)
      alert("error while sending data to backend")
    }
  }

  useEffect(() => {
    // Wait for permission to be loaded before initializing
    if (!permissionOfuser) return;

    // Initialize Quill editor
    if (!quillRef.current) {
      quillRef.current = new Quill(divRef.current!, {
        theme: "snow",
        modules: {
          toolbar: permissionOfuser === "VIEW" ? false : toolbarOptions,
          cursors: true,
        }
      })
      console.log("PERMISSION:", permissionOfuser)
    }

    // Create Yjs document - this holds the shared state
    ydocRef.current = new Y.Doc()
    
    // Get the 'quill' type from Yjs doc - this is the shared text structure
    const ytext = ydocRef.current.getText('quill')

    // Initialize WebSocket provider for real-time sync
    // Converts ws:// or wss:// from http:// or https://
    const wsUrl = import.meta.env.VITE_URL.replace(/^http/, 'ws')
    
    providerRef.current = new WebsocketProvider(
      wsUrl,
      `document-${documentId}`, // Room name
      ydocRef.current,
      {
        params: { 
          token: token || '',
          documentId: documentId || ''
        }
      }
    )

    // Awareness API - tracks user presence and cursors automatically
    const awareness = providerRef.current.awareness
    
    // Set local user info for awareness
    awareness.setLocalStateField('user', {
      name: decodedToken.email,
      color: getColorForUser(String(decodedToken.id)),
      userId: decodedToken.id
    })

    // Bind Quill editor to Yjs document
    // QuillBinding syncs Quill changes to Yjs and vice versa
    bindingRef.current = new QuillBinding(ytext, quillRef.current, awareness)

    // Load initial content from database only once
    if (content && ytext.length === 0) {
      // Disable observer temporarily to avoid triggering sync
      const delta = quillRef.current.clipboard.convert({ html: content })
      ytext.applyDelta(delta as any)
    }

    // Track active users via awareness
    const handleAwarenessChange = () => {
      const states = awareness.getStates()
      const users: { userId: number; userEmail: string }[] = []
      
      states.forEach((state, clientId) => {
        if (state.user && clientId !== awareness.clientID) {
          users.push({
            userId: state.user.userId,
            userEmail: state.user.name
          })
        }
      })
      
      setActiveUsers(users)
    }

    awareness.on('change', handleAwarenessChange)

    // Save to backend database periodically
    const handleTextChange = () => {
      if (permissionOfuser === "VIEW") return
      dataTobackend()
    }

    quillRef.current.on('text-change', handleTextChange)

    // Cleanup
    return () => {
      awareness.off('change', handleAwarenessChange)
      quillRef.current?.off('text-change', handleTextChange)
      
      // Destroy Yjs bindings and provider
      bindingRef.current?.destroy()
      providerRef.current?.destroy()
      ydocRef.current?.destroy()
      
      releaseColorForUser(String(decodedToken.id))
      if (debounce.current) clearTimeout(debounce.current)
      setActiveUsers([])
    }
  }, [permissionOfuser])

  useEffect(() => {
    if (permissionOfuser === "VIEW") {
        quillRef.current?.disable()
    } 
  },[permissionOfuser])

  const contentLoaded = useRef(false);
  useEffect(() => {
    if (quillRef.current && content && !contentLoaded.current) {
        quillRef.current.clipboard.dangerouslyPasteHTML(content)
        contentLoaded.current = true;
    }
  },[content])


  return (
    <>
     {permissionOfuser === "VIEW" && (
       <div style={{
         backgroundColor: '#f0f0f0',
         padding: '12px 20px',
         borderRadius: '4px',
         marginBottom: '10px',
         display: 'flex',
         alignItems: 'center',
         gap: '10px',
         border: '1px solid #d0d0d0'
       }}>
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
           <circle cx="12" cy="12" r="3"></circle>
         </svg>
         <span style={{ color: '#666', fontWeight: '500' }}>View Only Mode - You cannot edit this document</span>
       </div>
     )}
     <div ref={divRef} ></div>
    </>
   
  )
}

export default QuillEditor

