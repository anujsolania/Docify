import { Editor } from "./editor";

interface documentprops {
    params: Promise<{documentId: string}>;
}
const docidpage = async ({params}: documentprops) => {
    const { documentId } = await params;
    return ( 
        <div className="min-h-screen bg-[#FAFBFD]">
            <Editor></Editor>
        </div>
     );
}
 
export default docidpage;