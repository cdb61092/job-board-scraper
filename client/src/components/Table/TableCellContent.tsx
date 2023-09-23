import { Job } from '../../types';
import { excerpt } from "../../utils";

type TableCellContentProps = {
    job: Job;
    columnKey: keyof Job;
}
export const TableCellContent = ({job, columnKey}: TableCellContentProps) => {
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
}