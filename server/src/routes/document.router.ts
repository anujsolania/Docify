import express from "express";
import { documentSchema, docValidator } from "../validate/document.validate";
import { Authorization } from "../middleware/authorization.middleware";
import { createdocument, getdocument } from "../actions/document.actions";
const docRouter = express.Router()

docRouter.post("/create",docValidator(documentSchema),Authorization,createdocument)
docRouter.get("/",Authorization,getdocument)

export default docRouter