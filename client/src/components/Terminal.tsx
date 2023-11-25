import React, {useState} from 'react';

export const Terminal = () => {
    const [logs, setLogs] = React.useState<string[]>(['hello']);
    const [ws, setWs] = React.useState<WebSocket | null>(null);
    const [latestMessage, setLatestMessage] = useState<null | string>(null)
    const [typingText, setTypingText] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);

    const endOfMessagesRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'instant' });
        }
    }, [logs]);

    React.useEffect(() => {
        setLatestMessage(logs.slice(-1)[0]);

        // Start typing animation when a new message arrives
        setIsTyping(true);
        setTypingText('');
        const message = logs.slice(-1)[0];
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= message.length) {
                setTypingText(message.slice(0, currentIndex));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(typingInterval);
            }
        }, 100); // Adjust typing speed here
    }, [logs])

    // Parse the incoming websocket message and add it to the logs
    const handleNewMessage = React.useCallback((event: MessageEvent) => {
        const log = event.data;
        setLogs((prevLogs) => [...prevLogs, log]);
    }, []);

    React.useEffect(() => {
        const websocket = new WebSocket('ws://localhost:8080');

        websocket.onopen = () => {
            console.log('WebSocket connected');
        };

        websocket.onmessage = handleNewMessage;

        websocket.onclose = () => {
            console.log('WebSocket closed');
        };

        websocket.onerror = (error: Event) => {
            console.error('WebSocket Error', error);
        };

        setWs(websocket);

        // Close the websocket connection when the component unmounts
        return () => {
            if (ws) {
                ws.close()
            }
        };

    }, [handleNewMessage]);

    return (
        <div>
            <div className='h-10 bg-gray-600 rounded-t'>
                <div className='flex align-middle items-center h-full pl-2 gap-1'>
                    <Circle bgColorClass='bg-red-500'/>
                    <Circle bgColorClass='bg-yellow-500'/>
                    <Circle bgColorClass='bg-green-500'/>
                </div>
            </div>
            <div className='h-[500px] pl-2 bg-black text-left rounded-b overflow-scroll'>
                {logs.slice(0, -1).map((log, index) => (
                    <div key={index} className='text-lime-500'>
                        {log}
                    </div>
                ))}
                <div ref={endOfMessagesRef} className='text-lime-500'>
                    {isTyping ? <>{typingText}</> : latestMessage}<Cursor/>
                </div>

            </div>
        </div>
    )
}

interface CircleProps {
    bgColorClass: string
}

const Circle = ({ bgColorClass }:  CircleProps) => {
    return  (<div className={`rounded-full h-4 w-4 ${bgColorClass}`}></div>)
}

// Memoize the cursor so it blinks at a constant rate
const Cursor = React.memo(() => {
    return <div className='inline-block bg-lime-500 w-2 h-4 cursor animate-blink'></div>
});

