import Image from "next/image";
import { styled } from "styled-system/jsx";

const Footer = () => {
   return (
      <StyledWrapper>
         <footer className="footer">
            <div className="container">
            <div className="row">
               <div className="col">

                  <Image 
                     loading="lazy" 
                     width={90} 
                     height={56} 
                     className="footer-item img" 
                     src="/um1.png" 
                     alt="logo"
                  />

                  <p className="footer-item">contact: ulama.moris@gmail.com</p>
               </div>
               </div>
            </div>
         </footer>
      </StyledWrapper>
   )
}

const StyledWrapper = styled.div`
   & .footer {
      background: oklab(1 0 0 / 0.5);
      backdrop-filter: blur(8px);
      border: solid oklab(0.9 -0.005 0.00866025 / 0.5) 1px;

      & .col {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
      }
      

      & .footer-item {
        font-size: 14px;
        color: #71717a;
        padding: 0 12px;
      }

      & .img {
        width: 90px;
        height: auto;
      }
   }
`;

export default Footer;