import { Router } from "express";
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  
} from "../controllers/authorsController.js";

const authorsRouter = Router();

authorsRouter.get("/", getAllAuthors);
authorsRouter.get("/:id", getAuthorById);
authorsRouter.post("/", createAuthor);
authorsRouter.put("/:id", updateAuthor);
authorsRouter.delete("/:id", deleteAuthor);

export default authorsRouter;
