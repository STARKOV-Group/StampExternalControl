import React, { useState, useEffect, RefObject } from "react";
import { ContextMenu } from "./context-menu/menu-style";
import { ICustomEntity } from "./types";
import { pxToDot, getAbsoluteOffset } from "./functions";
import { useTranslation } from 'react-i18next';
import './stamp-control.css'

interface IPageContext {
    Id: string;
    Ref: RefObject<HTMLDivElement> | undefined;
    children?: React.ReactNode;
    entity: ICustomEntity;
    pageNumber: number;
}

const PageContainer = ({ Id, Ref, children, entity, pageNumber }: IPageContext) => {
    const { t } = useTranslation();
    const [clicked, setClicked] = useState(false);
    const [points, setPoints] = useState({
        x: 0,
        y: 0,
    });
    let menuClicked = false;

    useEffect(() => {
        const handleClick = () => {
            setClicked(false);
            menuClicked = false;
        }
        window.addEventListener("click", handleClick);
        return () => {
            window.removeEventListener("click", handleClick);
        };
    }, []);

    const handleStampAdd = async () => {
        const newStamp = await entity.StampInfostarkov.addNew()
        await newStamp?.changeProperty('PageNumber', pageNumber);
        await newStamp?.changeProperty('CoordX', pxToDot(points.x));
        await newStamp?.changeProperty('CoordY', pxToDot(points.y));
    };

    return (
        <div
            key={Id}
            id={Id}
            className='page'
            ref={Ref}
            onContextMenu={(e) => {
                e.preventDefault();
                if ((e.target as HTMLElement)?.id != Id)
                    return;

                setClicked(true);
                var offsets = getAbsoluteOffset(e.currentTarget);
                setPoints({
                    x: e.clientX - offsets.offsetX,
                    y: e.clientY - offsets.offsetY,
                });
            }}
            onMouseLeave={() => setClicked(false)}
            onMouseDown={() => {
                if (!menuClicked)
                    setClicked(false)
            }}
        >
            {clicked && (
                <ContextMenu top={points.y} left={points.x}>
                    <button onMouseDown={() => menuClicked = true} onClick={() => handleStampAdd()}>{t('stamp.buttons.add')}</button>
                </ContextMenu>
            )}
            {children}
        </div>
    );
};

export default PageContainer;
