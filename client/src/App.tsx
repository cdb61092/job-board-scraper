import React, {useCallback, useEffect, useMemo, useState} from 'react'
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
    SortDescriptor,
    Pagination,
} from "@nextui-org/react";
import type {Filters, Job} from './types';
import './App.css'
import {excerpt} from "./utils";
import {useJobs} from "./hooks/useJobs";

function App() {
    // const [ws, setWs] = useState<WebSocket | null>(null);  // Declare state to hold WebSocket object
    const jobs = useJobs();
    const [skillsFilter, setSkillsFilter] = useState<string[]>(["all"]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [listedSkills, setListedSkills] = useState<string[]>([]);

    // const [skills, setSkills] = useState(['js', 'javascript', 'react', 'react.js', 'php', 'laravel']);
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
        setListedSkills(Array.from(new Set(jobs.flatMap((job) => job.keywords))).sort());
    }, [jobs])

    const filteredItems = useMemo(() => {
        let filteredJobs = [...jobs];

        if (skillsFilter.length === 1 && skillsFilter.includes('all')) {
            return filteredJobs;
        } else {
            filteredJobs = filteredJobs.filter((job) => {
                return job.keywords.some((keyword) => {
                    return skillsFilter.includes(keyword);
                })
            })
        }

        return filteredJobs;
    }, [jobs, skillsFilter]);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Job] ?? '';
            const second = b[sortDescriptor.column as keyof Job] ?? '';
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        })
    }, [items, sortDescriptor]);

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

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const setWhere = (where: string) => setFilters((filters) => ({...filters, where}))

    const onNextPage = useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {jobs.length} jobs</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                            defaultValue={10}
                        >
                            <option value="5">5</option>
                            <option value="10" >10</option>
                            <option value="15">15</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        onRowsPerPageChange,
        jobs.length,
    ]);

    const bottomContent = useMemo(() => {
        return (
            <div className="flex justify-center gap-4">
                <div className="flex justify-center gap-4">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                    className={'w-[70%]'}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                        Previous
                    </Button>
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
                        Next
                    </Button>
                </div>
                </div>
            </div>
        )
    }, [page, pages, onNextPage, onPreviousPage]);

    return (
        <>
            <div>
                <div className='flex'>
                    {/* Search term filter */}
                    <Input label='Job Title' type="text" placeholder="Search term" value={filters.searchTerm}
                           onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}/>

                    {/* Location filter */}
                    <Input label='Location' type="text" placeholder="Where" value={filters.where}
                           onChange={(e) => setWhere(e.target.value)}/>
                </div>
                <div>
                    <h3 className='text-left text-2xl my-3'>Skills</h3>
                    <div className='flex flex-wrap gap-2 bg-black p-3 rounded-2xl'>
                        {listedSkills.map((skill) => {
                            return (
                                <Button
                                    key={skill}
                                    onClick={() =>
                                        setSkillsFilter(skillsFilter.includes(skill)
                                            ? skillsFilter.filter((s: string) => s !== skill)
                                            : [...skillsFilter, skill])
                                    }
                                    color={skillsFilter.includes(skill) ? 'success' : 'default'}
                                >
                                    {skill}
                                </Button>
                            )
                        })}
                    </div>

                </div>
                <Button onClick={() => initiateScraping(filters)}>
                    Scrape Indeed
                </Button>
                <Table
                    aria-label="Jobs table"
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor as any}
                    topContent={topContent}
                    bottomContent={bottomContent}
                    className='h-[80vh]'
                >
                    <TableHeader>
                        <TableColumn key='title' allowsSorting>Job Title</TableColumn>
                        <TableColumn key='company' allowsSorting>Company</TableColumn>
                        <TableColumn key='location' allowsSorting>Location</TableColumn>
                        <TableColumn key='keywords' allowsSorting>Keywords</TableColumn>
                        <TableColumn key='salary' allowsSorting>Salary</TableColumn>
                        <TableColumn key='description' allowsSorting>Description</TableColumn>
                    </TableHeader>
                    <TableBody
                        items={sortedItems}
                        loadingContent={<Spinner label="Loading..."/>}
                    >
                        {(item) => {
                            return (
                                <TableRow>
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey as keyof Job)}</TableCell>}
                                </TableRow>
                            )
                        }
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

{/* Remote filter */
}
{/*<Button onClick={() => setFilters({...filters, remote: {...filters.remote, enabled: !filters.remote.enabled}})} color={filters.remote.enabled ? 'success' : 'default'}>Remote</Button>*/
}

{/* Skills filter */
}
{/*<Dropdown>*/
}
{/*    <DropdownTrigger className="hidden sm:flex">*/
}
{/*        <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">*/
}
{/*            Skills*/
}
{/*        </Button>*/
}
{/*    </DropdownTrigger>*/
}
{/*    <DropdownMenu*/
}
{/*        disallowEmptySelection*/
}
{/*        aria-label="Table Columns"*/
}
{/*        closeOnSelect={false} */
}
{/*        selectedKeys={skillsFilter}*/
}
{/*        selectionMode="multiple"*/
}
{/*        onSelectionChange={setSkillsFilter as any}*/
}
{/*    >*/
}
{/*        {skills.map((skill) => (*/
}
{/*            <DropdownItem key={skill} className="capitalize">*/
}
{/*                {skill}*/
}
{/*            </DropdownItem>*/
}
{/*        ))}*/
}
{/*    </DropdownMenu>*/
}
{/*</Dropdown>*/
}
