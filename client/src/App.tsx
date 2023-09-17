import { useState } from 'react'
import {
    Button,
    Input,
    Table,
    TableHeader,
    TableBody,
    TableColumn,
    TableRow,
    TableCell,
    Spinner,
    getKeyValue
} from "@nextui-org/react";
import {useAsyncList} from "@react-stately/data";
import type { Filters, Job } from './types';
import { useJobs } from './hooks/useJobs';
import './App.css'

// interface SortOptions {
//     items: Items;
//     sortDescriptor: SortDescriptor;
// }
// type Items = Job[];
// type SortDescriptor = {
//     column: string;
//     direction: 'ascending' | 'descending';
// }

function App() {
    const [isLoading, setIsLoading] = useState(true);
    // const [ws, setWs] = useState<WebSocket | null>(null);  // Declare state to hold WebSocket object
    // const jobs = useJobs();
    const [filters, setFilters] = useState<Filters>({
        searchTerm: 'Software Engineer',
        where: 'Kansas City, MO',
        remote: {
            enabled: false,
            selector: 'button#filter-remotejob',
        },
    });

    let list = useAsyncList<Job, string>({
        async load({signal}) {
            let response = await fetch('http://localhost:8080/jobs', {signal});
            let json = await response.json();
            console.log('in list');
            console.log(json);
            setIsLoading(false);
            return {items: json};
        },
        async sort({items, sortDescriptor}) {
            return {
                items: (items as Job[]).sort((a: Job, b: Job) => {
                    let first = String(a[sortDescriptor.column as keyof Job]);
                    let second = String(b[sortDescriptor.column as keyof Job]);
                    let cmp = first.localeCompare(second);

                    if (sortDescriptor.direction === "descending") {
                        cmp *= -1;
                    }

                    return cmp;

                }),
            }
        }
    })


    const setWhere = (where: string) => setFilters((filters) => ({...filters, where }))

    // useEffect(() => {
    //     const wsInstance = new WebSocket('ws://localhost:8080');
    //
    //     // Wait for jobs to come in from the WebSocket connection
    //     wsInstance.addEventListener('message', function(event) {
    //         const { title, description, salary, company, foundKeywords: keywords, location } = JSON.parse(event.data);
    //         setJobs((prevJobs) => [...prevJobs, { title, description, salary, company, keywords, location }]);
    //     });
    //
    //     setWs(wsInstance);  // Set WebSocket object in state
    //
    //     // Clean up the WebSocket connection when component unmounts
    //     return () => {
    //         wsInstance.close();
    //     };
    // }, []); // Empty dependency array to ensure this runs only once
    //
    //
    // const stopScraping = () => {
    //     if (ws) {
    //         ws.send('STOP');
    //     }
    // };

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
                <Table
                    aria-label="Jobs table"
                    sortDescriptor={list.sortDescriptor}
                    onSortChange={list.sort}
                >
                    <TableHeader>
                        <TableColumn key='title'       allowsSorting>Job Title</TableColumn>
                        <TableColumn key='company'     allowsSorting>Company</TableColumn>
                        <TableColumn key='location'    allowsSorting>Location</TableColumn>
                        <TableColumn key='keywords'    allowsSorting>Keywords</TableColumn>
                        <TableColumn key='salary'      allowsSorting>Salary</TableColumn>
                        <TableColumn key='description' allowsSorting>Description</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={list.items}
                        isLoading={isLoading}
                        loadingContent={<Spinner label="Loading..." />}
                    >
                        {(item) => {
                            return (
                                <TableRow >
                                    {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                                </TableRow>
                            )}
                        }
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
