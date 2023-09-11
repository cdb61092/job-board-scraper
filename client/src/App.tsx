import { useEffect, useState } from 'react'
import {
    Button,
    Input,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell
} from "@nextui-org/react";
import {

} from "@nextui-org/react";
import './App.css'

interface Job {
    title: string;
    description: string;
    salary?: string;
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
            selector: 'button#filter-remotejob',
        },
    });

    useEffect(() => console.log(filters), [filters]);

    const setWhere = (where: string) => setFilters((filters) => ({ ...filters, where }))

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.addEventListener('open', function(event) {
            console.log('WebSocket connection opened:', event, 'State:', ws.readyState);
        });

        ws.addEventListener('message', function(event) {
            const { title, description, salary } = JSON.parse(event.data);
            setJobs((prevJobs) => [...prevJobs, { title, description, salary }]);
        });

        // Clean up the WebSocket connection when component unmounts
        return () => {
            ws.close();
        };
    }, []); // Empty dependency array to ensure this runs only once

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
                <h1>JOBS</h1>
                <Table aria-label="Jobs table">
                    <TableHeader>
                        <TableColumn>Job Title</TableColumn>
                        <TableColumn>Salary</TableColumn>
                        <TableColumn>Description</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {jobs.map((job, index) => {
                            return (
                                <TableRow key={index}>
                                    <TableCell>{job.title}</TableCell>
                                    <TableCell>{job.salary ?? ''}</TableCell>
                                    <TableCell>{job.description}</TableCell>
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
