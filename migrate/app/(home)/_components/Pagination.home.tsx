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

    const handleChange = (newPage: number) => {

        if(!newPage){
            return
        }

        const newParams = createSearchParams({page: newPage}).toString();

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