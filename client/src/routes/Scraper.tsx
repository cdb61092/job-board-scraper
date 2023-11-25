import {useState} from "react";
import {type Filters, RemoteType, ExperienceLevel, DeveloperSkill} from "../types";
import { DatePosted } from "../types";
import {Button, Input, Select, SelectItem} from "@nextui-org/react";
import {Terminal} from "../components/Terminal.tsx";

export const Scraper = () =>  {
    const [filters, setFilters] = useState<Filters>({
        searchTerm: 'Software Engineer',
        where: 'Kansas City, MO',
        remoteType: null,
        datePosted: null,
        experienceLevel: null,
        developerSkill: null
    });

    return (
        <div>
            <h1>Scraper</h1>
            <div className='flex gap-3'>
                {/* Search term filter */}
                <Input label='Job Title' type="text" placeholder="Search term" value={filters.searchTerm}
                       onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}/>

                {/* Location filter */}
                <Input label='Location' type="text" placeholder="Where" value={filters.where}
                       onChange={(e) => setFilters({...filters, where: e.target.value})}/>
                <Select
                    label="Date Posted"
                    placeholder="All"
                    className="max-w-xs"
                    onChange={(e) => setFilters({...filters, datePosted: e.target.value as DatePosted})}
                >
                    {Object.values(DatePosted).map((value) => {
                        return <SelectItem key={value}  value={value}>
                            {value}
                        </SelectItem>
                    })}
                </Select>
                <Select
                    label="Remote Type"
                    placeholder="All"
                    className="max-w-xs"
                    onChange={(e) => setFilters({...filters, remoteType: e.target.value as RemoteType})}
                >
                    {Object.values(RemoteType).map((value) => {
                        return <SelectItem key={value}  value={value}>
                            {value}
                        </SelectItem>
                    })}
                </Select>
                <Select
                    label="Experience Level"
                    placeholder="All"
                    className="max-w-xs"
                    onChange={(e) => setFilters({...filters, experienceLevel: e.target.value as ExperienceLevel})}
                >
                    {Object.values(ExperienceLevel).map((value) => {
                        return <SelectItem key={value}  value={value}>
                            {value}
                        </SelectItem>
                    })}
                </Select>
                <Select
                    label="Developer Skill"
                    placeholder="All"
                    className="max-w-xs"
                    onChange={(e) => setFilters({...filters, developerSkill: e.target.value as DeveloperSkill})}
                >
                    {Object.values(DeveloperSkill).map((value) => {
                        return <SelectItem key={value}  value={value}>
                            {value}
                        </SelectItem>
                    })}
                </Select>
            </div>
            <Button onClick={() => initiateScraping(filters)}>
                Scrape Indeed
            </Button>
            <Terminal />
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
            remoteType: filters.remoteType,
            datePosted:  filters.datePosted,
            experienceLevel: filters.experienceLevel,
            developerSkill: filters.developerSkill
        })
    }).then(() => console.info('Scraping started'));
}