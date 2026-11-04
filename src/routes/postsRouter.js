import { Router } from "express";
import { 
    createPost, 
    getAllPosts, 
    getPostById, 
    getPostByAuthor,
    updatePost, 
    deletePost 

} from "../controllers/postsController.js";

const postsRouter = Router();

postsRouter.post("/", createPost);
postsRouter.get("/", getAllPosts);
postsRouter.get("/:id", getPostById);
postsRouter.get("/author/:authorId", getPostByAuthor);
postsRouter.put("/:id", updatePost);
postsRouter.delete("/:id", deletePost);

export default postsRouter;
