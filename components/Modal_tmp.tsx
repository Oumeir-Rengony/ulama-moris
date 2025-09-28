import { ReactNode } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import type { ModalProps } from "@heroui/modal";
import { styled } from "../styled-system/jsx";
import { CircleX as CloseIcon } from "lucide-react"

export interface NextUIModalProps extends ModalProps{
    title?: string;
    children: ReactNode;
    className?: string;
};


const NextUIModal: React.FC<NextUIModalProps> = ({
    title,
    children,
    placement="top-center",
    className,
    ...otherProps
}) => {

    return (
        <Modal 
            placement={placement} 
            closeButton={<button><CloseIcon/></button>}
            classNames={{base: "base", closeButton: "close", body: "body"}}
            {...otherProps} 
        >
            <StyledWrapper>
                <ModalContent>
                    {   title && <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader> }
                    <ModalBody>
                        { children }
                    </ModalBody>
                </ModalContent>
            </StyledWrapper>
        </Modal>
       
    )
}


const StyledWrapper = styled.div`
   & .base {
        margin-top: 40px;
   }

   & .close {

        &:hover{
            background-color: #d6d6d6;
        }
   }

   & .body {
        padding: 0;
   }
`

export default NextUIModal;