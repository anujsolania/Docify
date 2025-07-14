import express from "express";
import { documentSchema, docValidator } from "../validate/document.validate";
import { Authorization } from "../middleware/authorization.middleware";
import { createdocument,getdocuments, searchdocuments } from "../actions/document.actions";
const docRouter = express.Router()

docRouter.post("/",docValidator(documentSchema),Authorization,createdocument)
docRouter.get("/",Authorization,getdocuments)
docRouter.get("/search",Authorization,searchdocuments)

export default docRouter