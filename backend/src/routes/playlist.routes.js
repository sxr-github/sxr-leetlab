import experss from "express";
import { authmiddleware } from "../middleware/auth.middleware.js";
import { addProblemToPlaylist, 
    createPlayList, 
    deletePlayList, 
    getPlayAllListDetails, 
    getPlayListDetails, 
    removeProblemFromPlaylist } from "../controllers/playlist.controller.js";

const playlistRoutes = experss.Router() ;

playlistRoutes.get("/" , authmiddleware , getPlayAllListDetails)

playlistRoutes.get("/:playlistId" , authmiddleware , getPlayListDetails)

playlistRoutes.post("/create-playlist" ,authmiddleware ,  createPlayList)



playlistRoutes.post('/:playlistId/add-problem' , authmiddleware , addProblemToPlaylist)

playlistRoutes.delete("/:playlistId" , authmiddleware , deletePlayList)

playlistRoutes.delete("/:playlistId/remove-problem" , authmiddleware , removeProblemFromPlaylist)

export default playlistRoutes;