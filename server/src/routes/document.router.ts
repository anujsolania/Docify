import express from "express";
import { documentSchema, docValidator } from "../validate/document.validate";
import { Authorization } from "../middleware/authorization.middleware";
import { alldocuments, createdocument,deletedocument,searchdocuments } from "../actions/document.actions";
const docRouter = express.Router()

docRouter.post("/", Authorization,createdocument)
docRouter.get("/",Authorization,alldocuments)
docRouter.get("/search",Authorization,searchdocuments)
docRouter.delete("/delete/:documentId",Authorization,deletedocument)

export default docRouter