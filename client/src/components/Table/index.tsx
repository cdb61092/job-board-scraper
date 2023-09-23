import { TopContent } from "./TopContent.tsx";
import { BottomContent } from "./BottomContent.tsx";
import { TableCellContent } from "./TableCellContent.tsx";
import {
    SortDescriptor,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow
} from "@nextui-org/react";
import {Job} from "../../types";
import React from "react";

type JobsTableProps = {
    jobs: Job[];
    sortDescriptor: SortDescriptor;
    setSortDescriptor: (sortDescriptor: SortDescriptor) => void;
    page: number;
    pages: number;
    setPage: (page: number) => void;
    onNextPage: () => void;
    onPreviousPage: () => void;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    sortedItems: Job[];
}

export const JobsTable = (
    {
        sortDescriptor,
        setSortDescriptor,
        page,
        pages,
        setPage,
        onNextPage,
        onPreviousPage,
        onRowsPerPageChange,
        jobs,
        sortedItems
    }: JobsTableProps) => {
    return (
        <Table
            aria-label="Jobs table"
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor as any}
            topContent={<TopContent numJobs={jobs.length} onRowsPerPageChange={onRowsPerPageChange} />}
            bottomContent={
                <BottomContent
                    page={page}
                    pages={pages}
                    setPage={setPage}
                    onNextPage={onNextPage}
                    onPreviousPage={onPreviousPage}
                />
            }
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
                            {(columnKey) => (
                                <TableCell>
                                    <TableCellContent job={item} columnKey={columnKey as keyof Job} />
                                </TableCell>)
                            }
                        </TableRow>
                    )
                }
                }
            </TableBody>
        </Table>
    )
}
