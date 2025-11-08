import Config from "@config/config.json";

export const getRelatedFatwas = async (category: string, limit: number = 4) => {

   try {
      const fatwasPromise = await fetch(`${Config?.fatwas?.domain}/api/fatwas/related?limit=${limit}&category=${category}`, {
         headers: {
            "Authorization": `Bearer ${process.env.API_MUFTI_MU_ULAMA_MORIS_TOKEN}`,
            "Content-Type": "application/json",
         },
      });

      const fatwasRes = await fatwasPromise.json();

      return fatwasRes;
   }
   catch (e) {
      console.error(e);
   }

}