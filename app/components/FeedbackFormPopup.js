import Popup from "./Popup";
import Button from "./Button";
import axios from "axios";
import { useState } from "react";
import Attachment from "./Attachment";
import AttachFilesButton from "./AttachFilesButton";
import { signIn, useSession } from "next-auth/react";
export default function FeedbackFormPopup({setShow, onCreate}) { 
    const [title , setTitle] = useState('');
    const [description , setDescription] = useState('');
    const [uploads , setUploads ] = useState([]);
    const {data: session} = useSession();
    async function handleCreatePostButtonClick(ev) {
        ev.preventDefault();
        if(session) {
            axios.post('/api/api/feedback' , {title , description , uploads})
            .then(() => {
                setShow(false);
                onCreate();
            });
        }
        else {
            localStorage.setItem('post_after_login', JSON.stringify({
                title , description , uploads
            }));
            await signIn('google');
        }
    }
    async function handleRemoveFileButtonclick(ev , link) {
        ev.preventDefault();
        setUploads(currentUpload => {
            return currentUpload.filter(val => val!== link);
        });
    }
    function addNewUploads(newLinks) {
        setUploads(prevLinks => [...prevLinks, ...newLinks]);
    }
    return (
        <Popup setShow={setShow} title={'Make a Suggestion'}>
            <form className="p-4">
                    <label className="block mt-4 mb-1 text-slate-700">Title</label>
                    <input className="w-full border p-2 rounded-md" type="text" 
                    placeholder="A short descriptive Title"
                     value={title} 
                     onChange={ev => setTitle(ev.target.value)}
                     />
                    <label className="block mt-4 mb-1 text-slate-700">Details</label>
                    <textarea 
                    className="w-full border" 
                    placeholder="Please include any details"
                    onChange={ev => setDescription(ev.target.value)}
                    value={description}
                    />
                    {uploads?.length > 0 && (
                        <div>
                            <label className="block mt-2 mb-1 text-slate-700">Attachments</label>
                            <div className="flex gap-3">
                                {uploads.map((link, index) => (
                                    <Attachment link={link} showRemoveButton={true}
                                    handleRemoveFileButtonclick={(ev,link) => handleRemoveFileButtonclick(ev,link)}/>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex gap-2 mt-2 justify-end">
                      <AttachFilesButton onNewFiles={addNewUploads}/>
                      <Button primary={true.toString()} onClick={handleCreatePostButtonClick}>
                        {session ? 'Create Post' : 'Login and post'}
                      </Button>
                    </div>
                </form>
        </Popup>
        
    );
}