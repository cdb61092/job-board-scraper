import {useState} from "react";
import {Filters} from "../types";
import {Button, Input} from "@nextui-org/react";

export const Scraper = () =>  {
    const [filters, setFilters] = useState<Filters>({
        searchTerm: 'Software Engineer',
        where: 'Kansas City, MO',
        remote: {
            enabled: false,
            selector: 'button#filter-remotejob',
        },
    });

    const setWhere = (where: string) => setFilters((filters) => ({...filters, where}))

    return (
        <div>
            <h1>Scraper</h1>
            <div className='flex gap-3'>
                {/* Search term filter */}
                <Input label='Job Title' type="text" placeholder="Search term" value={filters.searchTerm}
                       onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}/>

                {/* Location filter */}
                <Input label='Location' type="text" placeholder="Where" value={filters.where}
                       onChange={(e) => setWhere(e.target.value)}/>
            </div>
            <Button onClick={() => initiateScraping(filters)}>
                Scrape Indeed
            </Button>
        </div>
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