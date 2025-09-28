"use client"

import React from "react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";


import { styled } from "../styled-system/jsx"

import dayjs from "dayjs";
import config from "@config/config.json";

import { type DateRangeType } from "react-tailwindcss-datepicker"; 

const Datepicker = dynamic(() => import("react-tailwindcss-datepicker").then(mod => mod.default));

import { CalendarDays as DateIcon, SearchIcon} from "lucide-react";



export interface FilterProps {
    onSubmit?: Function;
}

const Filter: React.FC<FilterProps> = ({
    onSubmit
}) => {


    const [dateRange, setDateRange] = useState<DateRangeType>({
        startDate: '',
        endDate: ''
    });

    const [title, setTitle] = useState<string>("");

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    //if no inputs are filled, disable search button
    const disabledSearch = dateRange.startDate === null && dateRange.endDate === null && title === "";


    const handleSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {

        e.preventDefault();

        //if page has value, reset to 1
        const page = searchParams.get("page") ? '1' : null;

        const startDate = dayjs(dateRange.startDate).format(config.filter.calendarFormat);
        const endDate = dayjs(dateRange.endDate).format(config.filter.calendarFormat);

        const validStartDate = dayjs(startDate).isValid() ? startDate : null;
        const validEndDate = dayjs(endDate).isValid() ? endDate : null;

        //if search has whitespaces return null
        const search = !(/^\s*$/.test(title)) ? title : null;
        
          //add key conditionally else url will show empty query params
        const queryParamsObj = {
            //everytime search is clicked, reset page
            ...page ? { page } : {},  
            ...validStartDate ? { startDate } : {},
            ...validEndDate ? { endDate } : {},
            ...search ? { search } : {},
        }

        const queryParams = new URLSearchParams(queryParamsObj);
        router.push(`${pathname}?${queryParams.toString()}`);

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
                toggleIcon={() => <DateIcon size={20}/>}
            />

            <input 
                className="input"
                type="text" 
                placeholder="Title"
                aria-label="Title"
                onChange={(e) => setTitle(e.target.value)}
            />

            <button
                className="search-btn"
                disabled={disabledSearch}
                style={{opacity: disabledSearch ? 0.5 : 1}}
                type="submit"
                onClick={handleSearch}
            >
               Search <SearchIcon size={20}/>
            </button>

        </StyledWraper>
    )
};


const StyledWraper = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media(min-width: 1024px){
        flex-direction: row;
    }

    & .calendar {
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
        border-radius: 8px;

        @media(min-width: 1024px){
            flex: 1;
        }
    }

    & .input {
        height: 40px;
        border: solid rgb(228, 228, 231) 1px;
        padding: 8px 16px;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0,0,0,.16);

        @media(min-width: 1024px){
            flex: 1;
        }

    }

    & .search-btn {
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

        & .search-icon {
            width: 24px;
            height: 24px;
        }
    }


`;

export default Filter;