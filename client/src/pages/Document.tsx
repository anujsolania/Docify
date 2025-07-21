
import Navbar from "../components/Navbar";
import QuillEditor from "../components/QuillEditor";

const Document = () => {

  return (
     <div className="bg-gray-300 min-h-screen w-screen flex flex-col" >
      <Navbar/>
      <div className="grow mx-10 sm:mx-20 md:mx-30 lg:mx-40 xl:mx-60 2xl:mx-80 border border-gray-400 bg-white shadow-2xl" >
      <QuillEditor></QuillEditor>
      </div>
    </div>
  )
}

export default Document
