import RelatedCard from "@components/audio-card/related-card";
import { createQueryString, getWhatsAppLink } from "@services/utils/utils.service";


const RelatedList = ({ id }: { id: string}) => {


   return (
      <div className="related__list">
         {
            audioList?.map((audioItem) => {
               return (
                  <RelatedCard
                        key={audioItem?.sys?.id}
                        index={audioItem?.sys?.id}
                        {...audioItem}
                  />
               )
            })
         }
      </div>        
   )
}

export default RelatedList;