import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface Job {
    title: string;
    description: string;
}
function App() {
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.addEventListener('open', function(event) {
            console.log('WebSocket connection opened:', event, 'State:', ws.readyState);
        });

        ws.addEventListener('message', function(event) {
            console.log('WebSocket message received:', event.data);
            const { title, description } = JSON.parse(event.data);
            setJobs((prevJobs) => [...prevJobs, { title, description }]);
        });

        // Clean up the WebSocket connection when component unmounts
        return () => {
            ws.close();
        };
    }, []); // Empty dependency array to ensure this runs only once



    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => initiateScraping()}>
                    Start Scraping
                </button>
                <h1>JOBS</h1>
                {jobs.map((job, index) => {
                    return (
                        <div key={index}>
                            <p>Title: {job.title}</p>
                            <p>Description: {job.description}</p>
                        </div>
                    );
                })}
            </div>
        </>
    )
}

const initiateScraping = () => {
    fetch('http://localhost:8080/scrape', {"method": "POST"})
}

export default App
