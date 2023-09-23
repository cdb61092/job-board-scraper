import {Button} from "@nextui-org/react";
import React from "react";

type SkillsFiltersProps = {
    skillsFilter: string[];
    setSkillsFilter: React.Dispatch<React.SetStateAction<string[]>>;
    listedSkills: string[];
};

export const Skills: React.FC<SkillsFiltersProps> = ({ skillsFilter, setSkillsFilter, listedSkills }) => {
   return (
       <div>
           <h3 className='text-left text-2xl my-3'>Skills</h3>
               <div className='flex flex-wrap gap-2 bg-black p-3 rounded-2xl'>
                   {listedSkills.map((skill: string) => {
                       return (
                           <Button
                               key={skill}
                               onClick={() =>
                                   setSkillsFilter(skillsFilter.includes(skill)
                                       ? skillsFilter.filter((s: string) => s !== skill)
                                       : [...skillsFilter, skill])
                               }
                               color={skillsFilter.includes(skill) ? 'success' : 'default'}
                           >
                               {skill}
                           </Button>
                       )
                   })}
               </div>
       </div>

   )
}