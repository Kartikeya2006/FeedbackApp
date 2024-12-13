import axios from "axios";
import Button from "./Button";
import FeedbackItemPopupComments from "./FeedbackItemPopupComments";
import Popup from "./Popup";
import { MoonLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import Tick from "./icons/Tick";
import Attachment from "./Attachment";
import Link from "next/link";
import { useState } from "react";
import Edit from "./icons/Edit";
import AttachFilesButton from "./AttachFilesButton";
import Trash from "./icons/trash";
export default function FeedbackItemPopup({title , description, setShow , votes , onVotesChange , uploads, _id, user, onUpdate}) {
    const [isvotesLoading , setIsVotesLoading] = useState(false);
    const [isEditMode , setIsEditMode] = useState(false);
    const [newTitle , setNewTitle] = useState(title);
    const [newDescription , setNewDescription] = useState(description);
    const [newUploads , setNewUploads] = useState(uploads);
    const {data:session} = useSession();
    function handleVoteButtonClick() {
        axios.post('/api/vote' , {feedbackId:_id}).then(async () => {
           await  onVotesChange();
           setIsVotesLoading(false);
        });
    }
    function handleEditButtonclick() {
      setIsEditMode(true);
    }
    function handleRemoveFileButtonclick(ev, linkToRemove) {
      ev.preventDefault();
      setNewUploads(
        prevNewUploads => prevNewUploads.filter(l => l !== linkToRemove)
      );
    }
    function handleCancelButtonClick() {
      setIsEditMode(false);
      setNewTitle(title);
      setNewDescription(description);
      setNewUploads(uploads);
    }
    function handleNewUploads(newLinks) {
      setNewUploads(prevUploads => [...prevUploads, ...newLinks]);
    }
    function handleSaveButtonClick() {
      axios.put('/api/api/feedback', {
        id:_id,
        title: newTitle,
        description: newDescription,
        uploads: newUploads,
      }).then(() => {
        setIsEditMode(false);
        onUpdate({
          title: newTitle,
          description: newDescription,
          uploads: newUploads,
        });
      });

    }
    const iVoted = votes.find(v => v.userEmail === session?.user?.email)
    return (
        <Popup setShow={setShow}>
            <div className="p-8 pb-2">
              {isEditMode && (
                <input 
                className="w-full block mb-2 p-2 border rounded-md"
                value={newTitle}
                onChange={ev => setNewTitle(ev.target.value)}
                />
              )}
              {!isEditMode &&  (
                <h2 className="text-lg font-bold mb-2">
                    {title}
                </h2>
              )}
              {isEditMode && (
                <textarea 
                className="w-full block mb-2 p-2 border rounded-md"
                value={newDescription}
                onChange={ev => setNewDescription(ev.target.value)}
                />
              )}
              {!isEditMode && (
                <p className="text-gray-600">
                    {description}
                </p>
              )}
                {uploads?.length > 0 && (
                    <div className="mt-4">
                    <span className="text-sm text-gray-600">Attachments:</span>
                    <div className="flex gap-2">
                    {(isEditMode ? newUploads : uploads).map((link) => (
                      <Attachment
                        key={link} // Use a unique identifier, such as the link itself
                        link={link}
                        handleRemoveFileButtonclick={handleRemoveFileButtonclick}
                        showRemoveButton={isEditMode}
                      />
                    ))}
                    </div>
                  </div>
                  
                )}
            </div>
            <div className="flex gap-2 justify-end px-8 py-2 border-b">
              {isEditMode &&(
                <>
                  <AttachFilesButton onNewFiles={handleNewUploads}/>
                  <Button onClick={handleCancelButtonClick} className="flex gap-1">
                    <Trash/> Cancel
                  </Button>
                  <Button primary={true.toString()} onClick={handleSaveButtonClick}>
                    Save Changes
                  </Button>
                </>
              )}
              {!isEditMode && user?.email && session?.user?.email === user?.email && (
                <Button onClick={handleEditButtonclick} className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {!isEditMode && (
                <Button primary={true.toString()} onClick={handleVoteButtonClick}>
                    {isvotesLoading && (
                        <MoonLoader size={18}/>
                    )}
                    {!isvotesLoading && (
                        <>
                          {iVoted && (
                            <>
                                <div className="flex gap-1">
                                <Tick/>
                                Upvoted {votes?.length || '0'}
                                </div>   
                            </>
                          )}
                          {!iVoted && (
                            <>
                              <span className="triangle-vote-up"></span>
                              Upvote {votes?.length || '0'}
                            </>
                          )}
                        </>
                    )}
                </Button>
              )}
            </div>
            <div>
                <FeedbackItemPopupComments feedbackId={_id}/>
            </div>
        </Popup>
    );
}