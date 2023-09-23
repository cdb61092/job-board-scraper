import { useEffect, useState } from 'react'
import {
    Button,
    Input,
    SortDescriptor
} from "@nextui-org/react";
import type { Filters } from './types';
import './App.css'
import { useJobs } from "./hooks/useJobs";
import { Skills } from "./components/Skills.tsx";

import { usePagination } from "./hooks/usePagination.tsx";
import { useFilteredItems } from "./hooks/useFilteredItems.tsx";
import { useCurrentItems } from "./hooks/useCurrentItems.tsx";
import { useSortedItems } from "./hooks/useSortedItems.tsx";
import {JobsTable} from "./components/Table";

function App() {
    const jobs = useJobs();
    const [skillsFilter, setSkillsFilter] = useState<string[]>(["all"]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [listedSkills, setListedSkills] = useState<string[]>([]);

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "age",
        direction: "ascending",
    });

    const filteredItems = useFilteredItems({ jobs, skillsFilter });
    const items = useCurrentItems({ page, rowsPerPage, filteredItems });
    const sortedItems = useSortedItems({ items, sortDescriptor });

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const { onNextPage, onPreviousPage, onRowsPerPageChange } = usePagination({ page, pages, setPage, setRowsPerPage });

    const [filters, setFilters] = useState<Filters>({
        searchTerm: 'Software Engineer',
        where: 'Kansas City, MO',
        remote: {
            enabled: false,
            selector: 'button#filter-remotejob',
        },
    });

    useEffect(() => {
        setListedSkills(Array.from(new Set(jobs.flatMap((job) => job.keywords))).sort());
    }, [jobs])

    const setWhere = (where: string) => setFilters((filters) => ({...filters, where}))

    return (
        <>
            <div>
                <div className='flex gap-3'>
                    {/* Search term filter */}
                    <Input label='Job Title' type="text" placeholder="Search term" value={filters.searchTerm}
                           onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}/>

                    {/* Location filter */}
                    <Input label='Location' type="text" placeholder="Where" value={filters.where}
                           onChange={(e) => setWhere(e.target.value)}/>
                </div>
                <Skills skillsFilter={skillsFilter} setSkillsFilter={setSkillsFilter} listedSkills={listedSkills} />
                <Button onClick={() => initiateScraping(filters)}>
                    Scrape Indeed
                </Button>
                <JobsTable
                    jobs={jobs}
                    sortDescriptor={sortDescriptor}
                    setSortDescriptor={setSortDescriptor}
                    page={page}
                    pages={pages}
                    setPage={setPage}
                    onNextPage={onNextPage}
                    onPreviousPage={onPreviousPage}
                    onRowsPerPageChange={onRowsPerPageChange}
                    sortedItems={sortedItems}
                />
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