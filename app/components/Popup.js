import Button from "./Button";
export default function Popup({setShow , children , title , narrow}) {
    function close(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        setShow(false);
    } 
    return(
        <div className="fixed inset-0 bg-white md:bg-black md:bg-opacity-80 flex md:items-center" onClick={() => setShow(false)}>
            <button onClick={close} className="fixed top-2 right-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="hidden md:block w-8 h-8 top-4 right-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            </button>
            <div className="w-full h-full overflow-y-scroll">
            <div className={ (narrow ? 'md:max-w-sm bg-white md:mx-auto md:rounded-lg md:overflow-hidden md:my-4' : 'md:max-w-2xl bg-white md:mx-auto md:rounded-lg md:overflow-hidden md:my-4')} onClick={e => e.stopPropagation()} >
                <div className="relative min-h-[40px] md:min-h-0">
                    <button onClick={close} className="absolute top-4 left-4 md:hidden text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    </button>
                    {!!title && (
                    <h2 className="py-4 text-center border-b">
                      {title}
                    </h2>
                    )}
                    {children}
                </div>
            </div>
            </div>
        </div>
    );
}