import express from "express";
import { documentSchema, docValidator, shareDocSchema } from "../validate/document.validate";
import { Authorization } from "../middleware/authorization.middleware";
import { alldocuments, createdocument,deletedocument, getcollaborators, getdocumentone, sharedocument, updatedocument} from "../actions/document.actions";
const docRouter = express.Router()

docRouter.post("/", Authorization,createdocument)
docRouter.get("/",Authorization,alldocuments)
// docRouter.get("/search",Authorization,searchdocuments)
docRouter.delete("/delete/:documentId",Authorization,deletedocument)
docRouter.put("/update/:documentId",docValidator(documentSchema), Authorization,updatedocument)
docRouter.get("/:documentId",Authorization,getdocumentone)
docRouter.post("/share/:documentId",Authorization,docValidator(shareDocSchema),sharedocument)

docRouter.get("/getcollaborators/:documentId", Authorization, getcollaborators)

export default docRouter