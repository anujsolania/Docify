
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { useEffect, useRef } from "react";
import "../css/quill.css"

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
  const quillFlag = useRef<Quill | null>(null)

  useEffect(() => {
    if (divRef.current && !quillFlag.current) {
      quillFlag.current = new Quill(divRef.current,{theme: "snow",modules: {toolbar: toolbarOptions}})
    }
  },[])

  return (
    <div ref={divRef} ></div>
  )
}

export default QuillEditor
