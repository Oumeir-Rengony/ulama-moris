import React from "react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import { Input } from "@nextui-org/input";

import type { DateRangeType } from "react-tailwindcss-datepicker"; 
import { styled } from "styled-components";
import dayjs from "dayjs";
import config from "@config/config.json";


const Datepicker = dynamic(() => import("react-tailwindcss-datepicker").then(mod => mod.default));


const SearchIcon = () => (
    <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 128 128">
        <path fill="#fff" d="M108.9,108.9L108.9,108.9c-2.3,2.3-6.1,2.3-8.5,0L87.7,96.2c-2.3-2.3-2.3-6.1,0-8.5l0,0c2.3-2.3,6.1-2.3,8.5,0l12.7,12.7C111.2,102.8,111.2,106.6,108.9,108.9z"></path><path fill="#fff" d="M52.3 17.299999999999997A35 35 0 1 0 52.3 87.3A35 35 0 1 0 52.3 17.299999999999997Z" transform="rotate(-45.001 52.337 52.338)"></path><path fill="#fff" d="M52.3 17.299999999999997A35 35 0 1 0 52.3 87.3A35 35 0 1 0 52.3 17.299999999999997Z" transform="rotate(-45.001 52.337 52.338)"></path><path fill="#71c2ff" d="M52.3 84.3c-1.7 0-3-1.3-3-3s1.3-3 3-3c6.9 0 13.5-2.7 18.4-7.6 6.4-6.4 9-15.5 6.9-24.4-.4-1.6.6-3.2 2.2-3.6 1.6-.4 3.2.6 3.6 2.2C86 55.8 82.9 67.1 75 75 68.9 81 60.9 84.3 52.3 84.3zM73 35c-.8 0-1.5-.3-2.1-.9L70.7 34c-1.2-1.2-1.2-3.1 0-4.2 1.2-1.2 3.1-1.2 4.2 0l.2.2c1.2 1.2 1.2 3.1 0 4.2C74.5 34.7 73.8 35 73 35z"></path><path fill="#444b54" d="M52.3 90.3c-9.7 0-19.5-3.7-26.9-11.1-14.8-14.8-14.8-38.9 0-53.7 14.8-14.8 38.9-14.8 53.7 0h0C94 40.3 94 64.4 79.2 79.2 71.8 86.6 62.1 90.3 52.3 90.3zM52.3 20.4c-8.2 0-16.4 3.1-22.6 9.4-12.5 12.5-12.5 32.8 0 45.3C42.2 87.4 62.5 87.4 75 75c12.5-12.5 12.5-32.8 0-45.3C68.7 23.5 60.5 20.4 52.3 20.4zM111 98.3L98.3 85.6c-1.7-1.7-4-2.6-6.4-2.6-1.4 0-2.7.3-3.9.9l-2.5-2.5c-1.2-1.2-3.1-1.2-4.2 0-1.2 1.2-1.2 3.1 0 4.2l2.5 2.5c-.6 1.2-.9 2.5-.9 3.9 0 2.4.9 4.7 2.6 6.4L98.3 111c1.8 1.8 4.1 2.6 6.4 2.6s4.6-.9 6.4-2.6l0 0C114.5 107.5 114.5 101.8 111 98.3zM106.8 106.8c-1.2 1.2-3.1 1.2-4.2 0L89.8 94.1c-.6-.6-.9-1.3-.9-2.1s.3-1.6.9-2.1c.6-.6 1.3-.9 2.1-.9s1.6.3 2.1.9l12.7 12.7C108 103.7 108 105.6 106.8 106.8z"></path>
    </svg>
);


const DateIcon = () => (
    <svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
       <title>Calendar</title>
       <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"></path>
    </svg>
)


export interface FilterProps {
    onSubmit?: Function;
}

const Filter: React.FC<FilterProps> = ({
    onSubmit
}) => {


    const [dateRange, setDateRange] = useState<DateRangeType>({
        startDate: null,
        endDate: null
    });

    const [title, setTitle] = useState<string>("");

    const router = useRouter();

    //if no inputs are filled, disable search button
    const disabledSearch = dateRange.startDate === null && dateRange.endDate === null && title === "";


    const handleSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

        e.preventDefault();

        //if page has value, reset to 1
        const page = router?.query?.page ? 1 : null;

        const startDate = dayjs(dateRange.startDate).format(config.filter.calendarFormat);
        const endDate = dayjs(dateRange.endDate).format(config.filter.calendarFormat);

        const validStartDate = dayjs(startDate).isValid() ? startDate : null;
        const validEndDate = dayjs(endDate).isValid() ? endDate : null;

        //if search has whitespaces return null
        const search = !(/^\s*$/.test(title)) ? title : null;

        // const categories = categorySelected.length > 0 ? categorySelected.join(Config.filter.delimeter): null


         //add key conditionally else url will show empty query params
        const queryParams = {
            //everytime search is clicked, reset page
            ...page ? { page } : {},  
            ...validStartDate ? { startDate } : {},
            ...validEndDate ? { endDate } : {},
            ...search ? { search } : {},
            // ...categories ? { categories } : {}
        }
        
        router.push({
            pathname: router.pathname,
            query: queryParams
        }, undefined, { shallow: true });

        if(onSubmit){
            onSubmit();
        }
    };


    return (
        <StyledWraper className="filter">

            <Datepicker 
                useRange={false} 
                containerClassName={(className) => `${className} calendar`}
                primaryColor="blue"
                startFrom={new Date()} 
                value={dateRange} 
                onChange={setDateRange}
                toggleIcon={() => <DateIcon/>}
            />


            <Input 
                color="primary" 
                classNames={{base: 'input', inputWrapper: 'input-wrapper'}} 
                type="text" 
                variant="bordered" 
                placeholder="Title" 
                // isClearable={true}
                onChange={(e) => setTitle(e.target.value)}
            />

            <button
                className="search-btn"
                disabled={disabledSearch}
                style={{opacity: disabledSearch ? 0.5 : 1}}
                type="submit"
                onClick={handleSearch}
            >
               Search <SearchIcon/>
            </button>

        </StyledWraper>
    )
};


const StyledWraper = styled.form`

&.filter {
    margin: 24px 16px 40px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media(min-width: 1024px){
        flex-direction: row;
    }

    .calendar {
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        border-radius: 8px;

        @media(min-width: 1024px){
            flex: 1;
        }
    }

    .input {

        @media(min-width: 1024px){
            flex: 1;
        }

        .input-wrapper {
            height: 40px;
        }
    }

    .search-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #fff;
        background: rgb(0, 112, 240);
        height: 40px;
        border-radius: 8px;
        gap: 12px;

        @media(min-width: 1024px){
            flex: 0.5;
            margin-left: auto;
        }

        .search-icon {
            width: 24px;
            height: 24px;
        }
    }

    

}

`

export default Filter;