import {Job} from "../types";
import {useMemo} from "react";

type CurrentItemsProps = {
    page: number;
    filteredItems: Job[];
    rowsPerPage: number;
}

export const useCurrentItems = ({ page, rowsPerPage, filteredItems }: CurrentItemsProps) => {
    return useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);
}