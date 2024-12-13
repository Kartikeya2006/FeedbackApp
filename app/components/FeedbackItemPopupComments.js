import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import CommentForm from "./CommentForm";
import axios from "axios";
import Attachment from "./Attachment";
import TimeAgo from "timeago-react";
import { useSession } from "next-auth/react";
import AttachFilesButton from "./AttachFilesButton";

export default function FeedbackItemPopupComments({feedbackId}) {
    const [comments , setComments] = useState([]);
    const {data:session} = useSession();
    const [editingComment , setEditingComment] = useState(null);
    const [newCommentText , setNewCommentText] = useState('');
    const [newCommentUploads , setNewCommentUploads] = useState([]);
    useEffect(() => {
        fetchComments();
    } , []);
    function fetchComments() {
        axios.get('/api/comment?feedbackId='+feedbackId).then(res => {
            console.log(res.data);
            setComments(res.data);
        });
    }
    function handleEditButtonClick(comment) {
        setEditingComment(comment);
        setNewCommentText(comment.text);
        setNewCommentUploads(comment.uploads);
    }
    function handleCancelButtonClick() {
        setNewCommentText('');
        setNewCommentUploads([]);
        setEditingComment(null);
    }
    function handleRemoveFileButtonclick(ev,linkToRemove) {
        ev.preventDefault();
        setNewCommentUploads(prev => prev.filter(l => l!==linkToRemove));
    }
    function handleNewLinks(newLinks) {
        setNewCommentUploads(currentLinks => [...currentLinks, ...newLinks]);
    }
    async function handleSaveChangesButtonClick() {
        const newData = {text: newCommentText , uploads: newCommentUploads};
        await axios.put('/api/comment' , {id:editingComment._id, ...newData});
        setComments(existingComments => {
            return existingComments.map(comment => {
                if(comment._id === editingComment._id) {
                    return {...comment, ...newData};
                } else {
                    return comment;
                }
            });
        })
        setEditingComment(null);
    }
    return (
        <div className="p-8"> 
            {comments?.length > 0 && comments.map((comment, index) => (
                <div key={index} className="mb-8">
                    <div className="flex gap-4">
                        <Avatar url={comment.user.image} />
                        <div>
                            {editingComment?._id === comment._id && (
                                <textarea 
                                value={newCommentText} 
                                onChange={ev => setNewCommentText(ev.target.value)}
                                className="border p-2 block w-full"
                                />
                            )}
                            {editingComment?._id !== comment._id && (
                                <p className="text-gray-600">{comment.text}</p>
                            )}
                            <div className="text-gray-400 mt-2 text-sm">
                                {comment.user.name} 
                                &nbsp;&middot;&nbsp;
                                <TimeAgo
                                    datetime={comment.createdAt}
                                    locale='en-IN'
                                />
                                {editingComment?._id !== comment._id && !!comment.user.email && comment.user.email === session?.user?.email && (
                                    <>
                                        &nbsp;&middot;&nbsp;
                                        <span 
                                        onClick={() => handleEditButtonClick(comment)}
                                        className="cursor-pointer hover:underline">
                                            Edit
                                        </span>
                                    </>
                                )}
                                {editingComment?._id === comment._id &&  (
                                    <>
                                        &nbsp;&middot;&nbsp;
                                        <span 
                                        onClick={handleCancelButtonClick}
                                        className="cursor-pointer hover:underline"
                                        >
                                            Cancel
                                        </span>
                                        &nbsp;&middot;&nbsp;
                                        <span 
                                        onClick={handleSaveChangesButtonClick}
                                        className="cursor-pointer hover:underline">
                                            Save Changes
                                        </span>
                                    </>
                                )}
                            {/* yoyoyo:{editingComment?._id}  */}
                            </div>
                            {((editingComment?._id === comment._id )? newCommentUploads : comment.uploads).uploads?.length >0 && (
                                <div className="flex gap-2 mt-3"> egetg
                                    {(editingComment?._id === comment._id ? newCommentUploads : comment.uploads).map((link, index) => (
                                        <Attachment
                                         handleRemoveFileButtonclick={handleRemoveFileButtonclick}
                                         showRemoveButton={editingComment?._id === comment._id}
                                          key={index} link={link} />
                                    ))}
                                </div>
                            )}
                            {editingComment?._id === comment._id && (
                                <div className="mt-2">
                                    <AttachFilesButton onNewFiles={handleNewLinks} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {!editingComment && (
                <CommentForm feedbackId={feedbackId} onPost={fetchComments}/>
            )}
        </div>
    );
}