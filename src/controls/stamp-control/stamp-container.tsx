import React, { useState, useEffect, RefObject } from "react";
import { ContextMenu } from "./context-menu/menu-style";
import { ICustomEntity } from "./types";
import { getAbsoluteOffset } from "./functions";
import { useTranslation } from 'react-i18next';
import './stamp-control.css'

interface IStampContext {
    Id: string;
    Ref: RefObject<HTMLDivElement> | undefined;
    entity: ICustomEntity;
    stampId: number;
}

const StampContainer = ({ Id, Ref, entity, stampId }: IStampContext) => {
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

    const handleStampDelete = () => {
        var deletedRow = entity.StampInfostarkov.find((row) => row.Id == stampId);
        if (deletedRow)
            entity.StampInfostarkov.remove(deletedRow);
    };

    return (
        <div
            id={Id}
            className='stamp'
            ref={Ref}
            onContextMenu={(e) => {
                e.preventDefault();
                setClicked(true);
                var offsets = getAbsoluteOffset(e.currentTarget);
                setPoints({
                    x: e.clientX - offsets.offsetX,
                    y: e.clientY - offsets.offsetY
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
                    <button onMouseDown={() => menuClicked = true} onClick={() => handleStampDelete()}>{t('stamp.buttons.delete')}</button>
                </ContextMenu>
            )}
        </div>
    );
};

export default StampContainer;
