import { 
    Pagination, 
    PaginationProps, 
    PaginationItem, 
    PaginationItemRenderProps,
    PaginationItemType 
} from "@heroui/pagination";

  

const NextUIPagination: React.FC<PaginationProps> = (props) => { 

    const { page, total } = props;

    const renderItem = (props: PaginationItemRenderProps) => {    
        const { key, value, onPress } = props;
    
        const disabled = (
            (value === PaginationItemType.PREV && page === 1) || 
            (value === PaginationItemType.NEXT && page === total)
        )

        return (
          <PaginationItem role={null} key={key} isDisabled={disabled} {...props} />
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