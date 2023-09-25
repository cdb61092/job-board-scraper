import './App.css'
import { useEffect, useState } from 'react'
import { SortDescriptor } from "@nextui-org/react";
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

    useEffect(() => {
        setListedSkills(Array.from(new Set(jobs.flatMap((job) => job.keywords))).sort());
    }, [jobs])

    return (
        <>
            <div>
                <Skills skillsFilter={skillsFilter} setSkillsFilter={setSkillsFilter} listedSkills={listedSkills} />
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

export default App