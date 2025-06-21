interface documentprops {
    params: Promise<{documentId: string}>;
}
const docidpage = async ({params}: documentprops) => {
    const { documentId } = await params;
    return ( 
        <div>
            Document Id: { documentId }
        </div>
     );
}
 
export default docidpage;