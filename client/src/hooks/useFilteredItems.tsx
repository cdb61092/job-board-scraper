import { useMemo } from "react";
import type { Job } from "../types";

type FilteredItemsProps = {
    jobs: Job[];
    skillsFilter: string[];
}
export const useFilteredItems = ({ jobs, skillsFilter }: FilteredItemsProps) => {
    return useMemo(() => {
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
}