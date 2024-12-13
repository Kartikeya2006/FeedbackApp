import { useState } from "react";
import Button from "./Button";
import AttachFilesButton from "./AttachFilesButton";
import Attachment from "./Attachment";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";

export default function CommentForm({feedbackId, onPost}) {
    const [commentText , setCommentText] = useState('');
    const [uploads , setUploads] = useState([]);
    const {data: session} = useSession();
    function addUploads(newLinks) {
        setUploads(prevLinks => [...prevLinks, ...newLinks]);
    }
    function removeUpload(ev, linkToRemove) {
        ev.preventDefault();
        ev.stopPropagation();
        setUploads(prevLinks => prevLinks.filter(link => link !== linkToRemove))
    }
    async function handleCommentButtonClick(ev) {
        ev.preventDefault();
        const commentData = {
            text: commentText,
            uploads,
            feedbackId,
        };
        if(session) {
            await axios.post('/api/comment', commentData);
            setCommentText('');
            setUploads([]);
            onPost();
        }
        else {
            localStorage.setItem('comment_after_login', JSON.stringify(commentData));
            await signIn('google');
        }
    }
    return (
        <form>
            <textarea className="border rounded-md w-full p-2" placeholder="Let us know what you think..." 
            value={commentText} 
            onChange={e => setCommentText(e.target.value)}
            />
            {uploads?.length > 0 && (
                <div>
                    <div className="text-sm text-gray-600 mb-2 mt-3">Files:</div>
                    <div className="flex gap-3">
                        {uploads.map((link, index) => (
                            <Attachment 
                                key={index} 
                                link={link} 
                                showRemoveButton={true} 
                                handleRemoveFileButtonclick={(ev,link) => removeUpload(ev,link)} 
                            />
                        ))}
                    </div>
                </div>
            )}
            <div className="flex justufy-end gap-2 mt-2">
                <AttachFilesButton onNewFiles={addUploads} />
                <Button primary={true.toString()} onClick={handleCommentButtonClick} 
                    disabled={commentText === ''}>
                        {session ? 'Comment':'Login and Comment'}
                </Button> 
            </div>
        </form>
    );
}