import { 
    Pagination, 
    PaginationProps, 
    PaginationItem, 
    PaginationItemRenderProps,
    PaginationItemType 
} from "@nextui-org/pagination";

  
const NextUIPagination: React.FC<PaginationProps> = (props) => { 

    const { page, total } = props;

    const renderItem = (props: PaginationItemRenderProps) => {    
        const { key, value } = props;
    
        const disabled = (
            (value === PaginationItemType.PREV && page === 1) || 
            (value === PaginationItemType.NEXT && page === total)
        )

        return (
          <PaginationItem role={null} isDisabled={disabled} {...props} key={key} />
        );
    };


    return (
        <Pagination
          classNames={{base: 'pagination', wrapper: 'pagination-ul'}}
          showControls={true} 
          initialPage={page ? page : 1}
          disableAnimation={true}
          renderItem={renderItem}
          {...props}
        />
    )
}

export default NextUIPagination;