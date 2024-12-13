export default function Button(props) {
    const extraClasses = props?.className || '';
    return (
        
        <button {...props} 
        disabled={props.disabled}
        className={
            props.primary ? " flex items-center gap-2 py-1 px-4 rounded-md text-opacity-90 bg-blue-500 text-white " : " py-1 px-4 rounded-md text-opacity-90 text-gray-600 "
               + (props.disabled ? ' text-opacity-70 bg-opacity-70 cursor-not-allowed ':'') + extraClasses
        }/>
    );
}