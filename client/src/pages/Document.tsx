import Navbar from "../components/Navbar";
import QuillEditor from "../components/QuillEditor";

const Document = () => {

  return (
     <div className="bg-gray-300 min-h-screen w-screen flex flex-col" >
      <Navbar/>
      <div className="grow mx-50 border bg-white" >
      <QuillEditor></QuillEditor>
      </div>
    </div>
  )
}

export default Document
