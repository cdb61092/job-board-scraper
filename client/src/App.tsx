import {useCallback, useEffect, useMemo, useState} from 'react'
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
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem, SortDescriptor
} from "@nextui-org/react";
import type { Filters, Job } from './types';
import { ChevronDownIcon } from './ChevronDownIcon';
import './App.css'
import { excerpt } from "./utils";
import { useJobs } from "./hooks/useJobs";
import { keywords } from "./keywords";


function App() {
    // const [ws, setWs] = useState<WebSocket | null>(null);  // Declare state to hold WebSocket object
    const jobs = useJobs();
    const [skillsFilter, setSkillsFilter] = useState<string[]>(["all"]);

    const [skills, setSkills] = useState(['js', 'javascript', 'react', 'react.js', 'php', 'laravel', 'all']);
    const [filters, setFilters] = useState<Filters>({
        searchTerm: 'Software Engineer',
        where: 'Kansas City, MO',
        remote: {
            enabled: false,
            selector: 'button#filter-remotejob',
        },
    });
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "age",
        direction: "ascending",
    });

    useEffect(() => {
        console.log(skillsFilter)
    }, [skillsFilter])

    const filteredItems = useMemo(() => {
        let filteredJobs = [...jobs];

        if (skillsFilter.length === 1 && skillsFilter[0] === 'all') {
            return filteredJobs;
        } else {
            filteredJobs = filteredJobs.filter((job) => {
                return job.keywords.some((keyword) => {
                    return skillsFilter.includes(keyword);
                })
                // // Convert job description to lowercase and split into an array of words
                // const jobDescriptionWords = job.description.toLowerCase().split(/\s+/);
                //
                // // Check if any word in jobDescriptionWords is included in skillsFilter
                // return jobDescriptionWords.some(word => skillsFilter.includes(word.toLowerCase()));
            })
        }

        return filteredJobs;
    }, [jobs, skillsFilter])

    const renderCell = useCallback((job: Job, columnKey: keyof Job) => {
        const cellValue = job[columnKey] ?? 'N/A';

        // Render skills as a comma separated list
        if (Array.isArray(cellValue)) {
            return cellValue.join(', ');
        }

        switch (columnKey) {
            // Display only the first x characters of the description
            case 'description':
                return excerpt(cellValue);

                // If no special cases match, just return the cell value
            default:
                return cellValue;
        }
    }, []);

    useEffect(() => {
        console.log(skillsFilter);
    }, [skills]);

    const setWhere = (where: string) => setFilters((filters) => ({...filters, where }))

    return (
        <>
            <div className="card">
                <div style={{display: 'flex'}}>
                    {/* Search term filter */}
                    <Input type="text" placeholder="Search term" value={filters.searchTerm} onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}/>

                    <div>
                        {skills.map((skill) => {
                            return (
                                <Button
                                    key={skill}
                                    onClick={() =>
                                        setSkillsFilter(skillsFilter.includes(skill)
                                            ? skillsFilter.filter((s) => s !== skill)
                                            : [...skillsFilter, skill])
                                    }
                                    color={skillsFilter.includes(skill) ? 'success' : 'default'}
                                >
                                    {skill}
                                </Button>
                            )
                        })}
                    </div>

                    {/* Location filter */}
                    <Input type="text" placeholder="Where" value={filters.where} onChange={(e) => setWhere(e.target.value)} />
                </div>
                <Button onClick={() => initiateScraping(filters)}>
                    Scrape Indeed
                </Button>
                <h1>JOBS</h1>
                <Table
                    aria-label="Jobs table"
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor as any}
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
                        items={filteredItems}
                        loadingContent={<Spinner label="Loading..." />}
                    >
                        {(item) => {
                            return (
                                <TableRow >
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey as keyof Job)}</TableCell>}
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

// let list = useAsyncList<Job, string>({
//     // Fetch initial data
//     async load({signal}) {
//         let response = await fetch('http://localhost:8080/jobs', {signal});
//         let json = await response.json();
//         setIsLoading(false);
//         return {items: json};
//     },
//     // How to sort the rows
//     async sort({items, sortDescriptor}) {
//         return {
//             items: (items as Job[]).sort((a: Job, b: Job) => {
//                 let first = String(a[sortDescriptor.column as keyof Job]);
//                 let second = String(b[sortDescriptor.column as keyof Job]);
//                 let cmp = first.localeCompare(second);
//
//                 // If the sort direction is descending, reverse the comparison
//                 if (sortDescriptor.direction === "descending") {
//                     cmp *= -1;
//                 }
//                 return cmp;
//             }),
//         }
//     }
// });

{/* Remote filter */}
{/*<Button onClick={() => setFilters({...filters, remote: {...filters.remote, enabled: !filters.remote.enabled}})} color={filters.remote.enabled ? 'success' : 'default'}>Remote</Button>*/}

{/* Skills filter */}
{/*<Dropdown>*/}
{/*    <DropdownTrigger className="hidden sm:flex">*/}
{/*        <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">*/}
{/*            Skills*/}
{/*        </Button>*/}
{/*    </DropdownTrigger>*/}
{/*    <DropdownMenu*/}
{/*        disallowEmptySelection*/}
{/*        aria-label="Table Columns"*/}
{/*        closeOnSelect={false} */}
{/*        selectedKeys={skillsFilter}*/}
{/*        selectionMode="multiple"*/}
{/*        onSelectionChange={setSkillsFilter as any}*/}
{/*    >*/}
{/*        {skills.map((skill) => (*/}
{/*            <DropdownItem key={skill} className="capitalize">*/}
{/*                {skill}*/}
{/*            </DropdownItem>*/}
{/*        ))}*/}
{/*    </DropdownMenu>*/}
{/*</Dropdown>*/}
