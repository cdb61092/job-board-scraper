import {useMemo} from "react";
import {Job} from "../types";
import { SortDescriptor } from "@nextui-org/react";

type SortedItemsProps = {
    items: Job[];
    sortDescriptor: SortDescriptor;
}

export const useSortedItems = ({ items, sortDescriptor }: SortedItemsProps) => {
    return useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Job] ?? '';
            const second = b[sortDescriptor.column as keyof Job] ?? '';
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        })
    }, [items, sortDescriptor]);
}