import { useEffect, useState } from 'react'
import {
    Button,
    Input,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
} from "@nextui-org/react";
import {

} from "@nextui-org/react";
import './App.css'

interface Job {
    title: string;
    description: string;
    salary?: string;
    company: string;
    keywords: string[];
    location: string;
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
    const [ws, setWs] = useState<WebSocket | null>(null);  // Declare state to hold WebSocket object
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filters, setFilters] = useState<Filters>({
        searchTerm: 'Software Engineer',
        where: 'Kansas City, MO',
        remote: {
            enabled: false,
            selector: 'button#filter-remotejob',
        },
    });

    useEffect(() => console.log(filters), [filters]);

    const setWhere = (where: string) => setFilters((filters) => ({ ...filters, where }))

    useEffect(() => {
        const wsInstance = new WebSocket('ws://localhost:8080');

        // Wait for jobs to come in from the WebSocket connection
        wsInstance.addEventListener('message', function(event) {
            const { title, description, salary, company, foundKeywords: keywords, location } = JSON.parse(event.data);
            setJobs((prevJobs) => [...prevJobs, { title, description, salary, company, keywords, location }]);
        });

        setWs(wsInstance);  // Set WebSocket object in state

        // Clean up the WebSocket connection when component unmounts
        return () => {
            wsInstance.close();
        };
    }, []); // Empty dependency array to ensure this runs only once


    const stopScraping = () => {
        if (ws) {
            ws.send('STOP');
        }
    };

    return (
        <>
            <div className="card">
                <div style={{display: 'flex'}}>
                    {/* Search term filter */}
                    <Input type="text" placeholder="Search term" value={filters.searchTerm} onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}/>

                    {/* Remote filter */}
                    <Button onClick={() => setFilters({...filters, remote: {...filters.remote, enabled: !filters.remote.enabled}})} color={filters.remote.enabled ? 'success' : 'default'}>Remote</Button>

                    {/* Location filter */}
                    <Input type="text" placeholder="Where" value={filters.where} onChange={(e) => setWhere(e.target.value)} />
                </div>
                <Button onClick={() => initiateScraping(filters)}>
                    Scrape Indeed
                </Button>
                <Button onClick={() => stopScraping()}>
                    Stop Scraping
                </Button>
                <h1>JOBS</h1>
                <Table aria-label="Jobs table">
                    <TableHeader>
                        <TableColumn>Job Title</TableColumn>
                        <TableColumn>Company</TableColumn>
                        <TableColumn>Location</TableColumn>
                        <TableColumn>Keywords</TableColumn>
                        <TableColumn>Salary</TableColumn>
                        <TableColumn>Description</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {jobs.map(({ title, description, salary, company, keywords, location }, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{title}</TableCell>
                                    <TableCell>{company}</TableCell>
                                    <TableCell>{location}</TableCell>
                                    <TableCell>{keywords.join(', ')}</TableCell>
                                    <TableCell>{salary}</TableCell>
                                    <TableCell>{`${description.slice(0, 300)}...`}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
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
    }).then(() => console.info('Scraping started'));
}

export default App
