import PaperClip from "./icons/PaperClip";
import Trash from "./icons/trash";

export default function Attachment({ link, showRemoveButton = false, handleRemoveFileButtonclick }) {
    return (
        <div className="relative">
            <a href={link} target="_blank" rel="noopener noreferrer" className="h-16">
                {showRemoveButton && (
                    <button
                        onClick={ev => handleRemoveFileButtonclick(ev, link)}
                        className="h-7 w-7 bg-red-400 p-1 rounded text-white"
                    >
                        <Trash />
                    </button>
                )}
                {link?.endsWith('.png') ? (
                    <img className="h-16 rounded-md" src={link} alt="Uploaded" />
                ) : (
                    <div className="bg-gray-200 h-16 p-2 flex items-center rounded-md">
                        <PaperClip />
                        {link.split('/')[3]?.substring(13)}
                    </div>
                )}
            </a>
        </div>
    );
}
