'use client';

import { createSearchParams } from "@services/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PaginationComponent from "@components/Pagination";

const Pagination = ({
    page,
    total
}) => {

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = new URLSearchParams(useSearchParams());

    const handleChange = (newPage: number) => {

        if(!newPage){
            return
        }

        //add date conditionally else url will show empty query params
        const queryParams = {
            ...Object.fromEntries(searchParams),
            page: newPage
        }

        const newParams = createSearchParams(queryParams).toString();

        router.push(`${pathname}?${newParams}`);
    }

    return (
        <PaginationComponent
            page={+page}
            total={total}
            onChange={handleChange}
        />
    )
}


export default Pagination;