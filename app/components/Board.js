'use client';
import { useEffect, useRef, useState } from "react";
import FeedbackItem from "./FeedbackItem";
import FeedbackFormPopup from "./FeedbackFormPopup";
import Button from "./Button";
import FeedbackItemPopup from "./FeedbackItemPopup";
import axios from "axios";
import { useSession } from "next-auth/react"
import { MoonLoader } from "react-spinners";
import SearchIcon from "./icons/SearchIcon";
import { debounce } from "lodash";

export default function Board() {

    const [showFeedbackPopupForm , setShowFeedbackPopupForm] = useState(false);
    const [showFeedbackPopupItem , setShowFeedbackPopupItem] = useState(null);
    const [feedbacks , setFeedbacks] = useState([]) ;
    const fetchingFeedbacksRef = useRef(false);
    const [fetchingFeedbacks , setFetchingFeedbacks] = useState(false);
    const waitingRef = useRef(false);
    const [waiting , setWaiting] = useState(false);  
    const [votesLoading , setVotesLoading] = useState(false);
    const [sort , setSort] = useState('votes');
    const sortRef = useRef('votes');
    const loadedRows = useRef(0);
    const everythingLoadedRef = useRef(false);
    const [votes , setVotes] = useState([]);
    const [searchPhrase , setSearchPhrase] = useState('');
    const searchPhraseRef = useRef('');
    const debouncedFetchFeedbacksRef = useRef(debounce(fetchFeedbacks, 250));
    const {data:session} = useSession([]);
    useEffect(() => {
        fetchFeedbacks();
    }, []);
    useEffect(() => {
        fetchVotes();
    },[feedbacks]);
    useEffect(() => {
        loadedRows.current=0;
        sortRef.current = sort;
        searchPhraseRef.current = searchPhrase;
        everythingLoadedRef.current = false;
        if(feedbacks?.length > 0)
            setFeedbacks([]);
        debouncedFetchFeedbacksRef.current();
    }, [sort , searchPhrase]);
    useEffect(() => {
        if(session?.user?.email) {
            const feedbackToVote = localStorage.getItem('vote_after_login');
            if (feedbackToVote) {
            axios.post('/api/vote' , {feedbackToVote}).then(() => {
                localStorage.removeItem('vote_after_login'); 
                fetchVotes();
            });   
        }
        const feedbackToPost = localStorage.getItem('post_after_login');
        if(feedbackToPost) {
            const feedbackData = JSON.parse(feedbackToPost);
            axios.post('/api/api/feedback', feedbackData).then(async (res) => {
                await fetchFeedbacks();
                setShowFeedbackPopupItem(res.data);
                localStorage.removeItem('post_after_login');
            });
        }
        const commentToPost = localStorage.getItem('comment_after_login');
        if(commentToPost) {
            const commentData = JSON.parse(commentToPost);
            axios.post('/api/comment', commentData).then(() => {
                axios.get('/api/api/feedback?id='+commentData.feedbackId).then(res => {
                    setShowFeedbackPopupItem(res.data);
                    localStorage.removeItem('comment_after_login');
                });
            });
        }
        }
    } , [session?.user?.email]);
    function handleScroll() {
        const html = window.document.querySelector('html');
        const howMuchScrolled = html.scrollTop;
        const howMuchIsToScroll = html.scrollHeight;
        const leftToScroll = howMuchIsToScroll - howMuchScrolled - html.clientHeight;
        if(leftToScroll <= 100) {
            fetchFeedbacks(true);
        }
    }
    function registerScrollListener() {
        window.addEventListener('scroll', handleScroll);
    }
    function unregisterScrollListener() {
        window.removeEventListener('scroll', handleScroll);
    }
    useEffect(() => {
        registerScrollListener();
        return () => {unregisterScrollListener();}
    },[]);
    async function fetchFeedbacks(append = false) {
        if(fetchingFeedbacksRef.current) return;
        if(everythingLoadedRef.current) return;
        fetchingFeedbacksRef.current = true;
        setFetchingFeedbacks(true);
        await axios.get(`/api/api/feedback?sort=${sortRef.current}&loadedRows=${loadedRows.current}&search=${searchPhraseRef.current}`).then(res => {
            if(append) {
                setFeedbacks(currentFeedbacks => [...currentFeedbacks, ...res.data]);
            } else {
                setFeedbacks(res.data);
            }
            if(res.data?.length > 0) {
                loadedRows.current += res.data.length;
            }
            if(res.data?.length == 0) {
                everythingLoadedRef.current = true;
            }
            fetchingFeedbacksRef.current =false;
            setFetchingFeedbacks(false);
            waitingRef.current = false;
            setWaiting(false);
        });
    }
    async function fetchVotes() {
        setVotesLoading(true);
        const ids = feedbacks.map(f => f._id);
        const res = await axios.get('/api/vote?feedbackIds='+ids.join(','));
        setVotes(res.data);
        setVotesLoading(false);
    }
    function openFeedbackPopupForm() {
        setShowFeedbackPopupForm(true);
    }
    function openFeedbackPopupItem(feedback) {
        setShowFeedbackPopupItem(feedback);
    }
    async function handleFeedbackUpdate(newData) {
        setShowFeedbackPopupItem(prevData => {
            return {...prevData, ...newData};
        });
        await fetchFeedbacks();
    } 

    return (
        <main className="bg-white md:max-w-2xl mx-auto md:shadow-lg md:rounded-lg md:mt-4 md:mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-400 p-8">
                <h1 className="font-bold text-xl">Building my first software</h1>
                <p className="text-opacity-90 text-slate-700">Hi there i am currently trying to build a feedback form which is actuualy my first time building anything so i had to copy and get this fucking thing inside my head.</p>
            </div>
            <div className="bg-gray-100 px-8 py-2 flex border-bottom items-center">
                <div className="grow flex items-center gap-4 text-gray-400">
                    <select 
                    value={sort}
                    onChange={ev => {setSort(ev.target.value);}}
                    className="bg-transparent py-2 ">
                        <option value="votes">Most Voted</option>
                        <option value="latest">Latest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                    <div className="relative">
                        <SearchIcon/>
                        <input type="text" 
                        placeholder="Search" 
                        value={searchPhrase}
                        onChange={ev => setSearchPhrase(ev.target.value)}
                        className="bg-transparent p-2 pl-7"/>
                    </div>
                </div>
                <div>
                    <Button primary={true.toString()} onClick={openFeedbackPopupForm} >Make a Suggestion</Button>
                </div>
            </div>
            <div className="px-8">
                {feedbacks?.length === 0 && !fetchingFeedbacks && !waiting && (
                    <div className="py-4 text-3xl text-gray-600 ">No results found :(</div>
                )}
                {feedbacks.map((feedback, index) => (
                <FeedbackItem 
                    key={index} // Provide a unique key for each child
                    {...feedback}
                    onVotesChange={() => {fetchVotes()}}
                    votes = {votes.filter(v => v.feedbackId.toString() === feedback._id.toString())}
                    parentLoadingVotes={votesLoading}
                    onOpen={() => openFeedbackPopupItem(feedback)} 
                />
            ))}
            {(fetchingFeedbacks || waiting) && (
                <div className="p-4">
                    <MoonLoader size={24}/>
                </div>
            )}
            </div>
            {showFeedbackPopupForm && (
                <FeedbackFormPopup onCreate={fetchFeedbacks}
                setShow={setShowFeedbackPopupForm} />
            )}
            {showFeedbackPopupItem && (
                <FeedbackItemPopup {...showFeedbackPopupItem} 
                votes={votes.filter(v => v.feedbackId.toString() === showFeedbackPopupItem._id)}
                onVotesChange={fetchVotes}
                onUpdate={handleFeedbackUpdate}
                setShow={setShowFeedbackPopupItem} />
            )}
        </main>
    );
}