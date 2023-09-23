import React, {useCallback} from "react";

type PaginationProps = {
    page: number;
    pages: number;
    setPage: (page: number) => void;
    setRowsPerPage: (rowsPerPage: number) => void;
}

export const usePagination = ({ page, setPage, pages, setRowsPerPage }: PaginationProps) => {
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


    return { onNextPage, onPreviousPage, onRowsPerPageChange }
}