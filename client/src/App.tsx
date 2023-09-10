import {useEffect, useState} from 'react'
import './App.css'

interface Job {
    title: string;
    description: string;
}

interface Filters {
    searchTerm: string;
    where: string;
    remote: {
        enabled: boolean;
        selector: string;
    }
}

function App() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filters, setFilters] = useState<Filters>({
        searchTerm: 'Software Engineer',
        where: 'Kansas City, MO',
        remote: {
            enabled: false,
            selector: 'a.filter-remotejob',
        },
    });

    const setWhere = (where: string) => setFilters((filters) => ({ ...filters, where }))

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.addEventListener('open', function(event) {
            console.log('WebSocket connection opened:', event, 'State:', ws.readyState);
        });

        ws.addEventListener('message', function(event) {
            const { title, description } = JSON.parse(event.data);
            setJobs((prevJobs) => [...prevJobs, { title, description }]);
        });

        // Clean up the WebSocket connection when component unmounts
        return () => {
            ws.close();
        };
    }, []); // Empty dependency array to ensure this runs only once


    useEffect(() => {
        console.log(filters)
    }, [filters]);



    return (
        <>
            <div className="card">
                <div style={{display: 'flex'}}>
                    <input type="text" placeholder="Search term" value={filters.searchTerm} onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}/>
                    <button onClick={() => setFilters({...filters, remote: {...filters.remote, enabled: !filters.remote.enabled}})}>Remote</button>
                    <input type="text" placeholder="Where" value={filters.where} onChange={(e) => setWhere(e.target.value)} />
                </div>
                <button onClick={() => initiateScraping(filters)}>
                    Scrape Indeed
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

const initiateScraping = (filters: Filters) => {
    fetch('http://localhost:8080/scrape', {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({
            searchTerm: filters.searchTerm,
            where: filters.where,
            remote: filters.remote
        })
    })
}

export default App
