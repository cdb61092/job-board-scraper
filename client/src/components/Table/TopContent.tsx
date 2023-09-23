import React, { useMemo} from "react";

type TopContentProps = {
    numJobs: number;
    onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TopContent: React.FC<TopContentProps> = ({ numJobs, onRowsPerPageChange }) => {
  return useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {numJobs} jobs</span>
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
        numJobs,
    ]);
}