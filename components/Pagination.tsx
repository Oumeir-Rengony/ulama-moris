"use client";

import { 
    Pagination, 
    PaginationProps, 
    PaginationItem, 
    PaginationItemRenderProps,
    PaginationItemType 
} from "@heroui/pagination";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
  

const NextUIPagination: React.FC<PaginationProps> = (props) => { 

    const { page, total } = props;
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const renderItem = (props: PaginationItemRenderProps) => {    

        const { key, value, onPress } = props;
    
        const disabled = (
            (value === PaginationItemType.PREV && page === 1) || 
            (value === PaginationItemType.NEXT && page === total)
        )

        return (
          <PaginationItem role={null} isDisabled={disabled} {...props} key={key}/>
        );
    };

    const handlePageChanges = async(newPage: number) => {
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set('page', `${newPage}`);
        router.push(`${pathname}?${queryParams.toString()}`);
    }

    return (
        <Pagination
          classNames={{base: 'pagination', wrapper: 'pagination-ul'}}
          showControls={true} 
          initialPage={page ? page : 1}
          disableAnimation={true}
          renderItem={renderItem}
          onChange={handlePageChanges}
          {...props}
        />
    )
}

export default NextUIPagination;