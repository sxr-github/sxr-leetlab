import { db } from "../libs/db.js";


export const createPlayList = async (req, res) =>{
    try {
        const {name ,description} = req.body ;

        const userId = req.user.id ;

        const playlist = await db.playlist.create({
            data :{
                name,
                description,
                userId
            }
         })

         res.statis(200).json({
            success : true ,
            message :"Palylist Created Successfully",
            playlist
         })
    } catch (error) {
        console.error("Error Creating Playlist :" , error);
        res.status(500).json({error : 'Failed to create playlist'}) ;
    }
}

export const getPlayAllListDetails = async (req, res) =>{
    try {
        const playlists = await db.playlist.findMany({
            where:{
                userId : req.user.id ,

            },
            include:{
                problems:{
                    include:{
                        problem:true
                    }
                }
            }
        })
        res.statis(200).json({
            success : true ,
            message :"Palylist Fetched Successfully",
            playlists
        })
    } catch (error) {
        console.error("Error Fetching Playlist :" , error);
        res.status(500).json({error : 'Failed to fetch playlist'}) ;
    }
}

export const getPlayListDetails = async (req, res) =>{
    const {playlistId} = req.params ;
    try {
        const playlist = await db.playlist.findUnique({
            where:{
                id : playlistId,
                userId : req.user.id ,

            },
            include:{
                problems:{
                    include:{
                        problem:true
                    }
                }
            }
        })

        if(!playlist){
            return res.status(404).json({error : 'Playlist not found'}) ;
        }
         res.status(200).json({
            success : true ,
            message :"Palylist Fetched Successfully",
            playlist,
        }) 
    } catch (error) {
        console.error("Error Fetching Playlist :" , error);
        res.status(500).json({error : 'Failed to fetch playlist'}) ;
    }

}

export const addProblemToPlaylist = async (req, res) =>{
    const {playlistId} = req.params ;
    const {problemIds} = req.body ;

    try {
        
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({error : "Invalid or missing problemsId"})
        }

        //create record for each problem in the playlist

        const problemsInPlaylist = await db.problemsInPlaylist.createMany({
            data:problemIds.map((problemId ) =>({
                playlistId,
                problemId
            }))
        })

        res.status(201).json({
            success : true ,
            message : 'Problems added to the playlist successfully',
            problemsInPlaylist,
        })
    } catch (error) {
        console.error("Error Adding Problem in Playlist :" , error);
        res.status(500).json({error : 'Failed to add problem playlist'}) ;
    }
}

export const deletePlayList = async (req, res) =>{
    const {playlistId} = req.params;
    try {
        const deletedplaylist = await db.playlist.delete({
            where:{
                id:playlistId
            }
        })
        res.status(200).json({
            success : true ,
            message :"Palylist deleted Successfully",
            deletedplaylist,
        })
        
    } catch (error) {
        console.error("Error deleting Playlist :" , error);
        res.status(500).json({error : 'Failed to delete the playlist'}) ;
    }
}

export const removeProblemFromPlaylist = async (req, res) => {
    const {playlistId} = req.params;
    const {problemIds} =req.body;


    try {
         if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({error : "Invalid or missing problemsId"})
        }
         const deletedPorblem = await db.problemsInPlaylist.deleteMany({
            where:{
                playlistId,
                problemId:{
                    in:problemIds
                }
            }
        })
         res.status(200).json({
            success : true ,
            message :"Problem deleted from playlist Successfully",
            deletedPorblem,
        })

    } catch (error) {
        console.error("Error deleting Problem :" , error);
        res.status(500).json({error : 'Failed to delete the Problem'}) ;
    }
}