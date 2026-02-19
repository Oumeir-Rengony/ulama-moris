"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useLayoutEffect, useState } from "react";
import { styled } from "styled-system/jsx"

const BayaanSwitcher = ({
   onClick
}:any) => {
   const [activeIndex, setActiveIndex] = useState(0);

   const path = usePathname();


   useLayoutEffect(() => {
      if(path === "/international"){
         setActiveIndex(1)
      }
      else{
         setActiveIndex(0);
      }
   },[path])

   const handleClick = () => {
      onClick?.();
   }

   return (
      <StyledWrapper>
         <div className="tabs">
            <Link scroll={false} href="/" className={`tab ${activeIndex === 0 ? 'active' : ""}`} onClick={handleClick}>Local Bayaan</Link>
            <Link scroll={false} href="/international" className={`tab ${activeIndex === 1 ? 'active' : ""}`} onClick={handleClick}>International</Link>
         </div>
      </StyledWrapper>
   )
}


const StyledWrapper = styled.div`
   & .tabs {
      display: flex;
      background: #e9eef6;
      padding: 4px;
      border-radius: 8px;
      gap: 4px;
      margin: 1rem 1rem 2rem;
   }

   & .tab {
      flex: 1;
      text-align: center;
      padding: 8px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
   }

   & .tab.active {
      background: white;
      color: var(--primary);
      font-weight: 600;
   }
`;

export default BayaanSwitcher;