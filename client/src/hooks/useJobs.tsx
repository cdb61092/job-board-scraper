import {useEffect, useState} from "react";
import type { Job } from '../types';



export const useJobs = () => {
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Make a GET request to the /jobs endpoint
                const response = await fetch('http://localhost:8080/jobs');
                // Parse the JSON data from the response
                const data = await response.json();
                // Update the jobs state variable with the received data
                setJobs(data);
            } catch (error) {
                console.error('An error occurred while fetching data:', error);
            }
        }
        fetchJobs();
    }, [])

    return jobs;
}

