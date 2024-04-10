import React, { MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { IRemoteComponentCardApi, ControlUpdateHandler } from '@directum/sungero-remote-component-types';
import { ICustomEntity, IPagesRow, IStampInfoRow } from './types';
import './stamp-control.css'
import { number } from 'yargs';

interface IProps {
    api: IRemoteComponentCardApi;
}

const StampControl: React.FC<IProps> = ({ api }) => {
    //#region Entity
    const [entity, setEntity] = useState<ICustomEntity>(() => api.getEntity<ICustomEntity>());
    const [pageInfo, setPageInfo] = useState<IPagesRow | undefined>(entity.Pagesstarkov.find(() => true));
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(1);
    const [currentStampId, setCurrentStampId] = useState<number>();
    const isLocked = entity.LockInfo && entity.LockInfo.IsLocked && (!entity.LockInfo.IsLockedByMe || !entity.LockInfo.IsLockedHere);
    const isEnabled = entity.State.IsEnabled && !isLocked;

    const handleControlUpdate: ControlUpdateHandler = useCallback(() => {
        setEntity(api.getEntity<ICustomEntity>());
        setPageInfo(entity.Pagesstarkov.find(() => true));
        setCurrentPageNumber(1);
    }, [api, setEntity]);
    api.onControlUpdate = handleControlUpdate;

    const handleCoordinateChange = (coordX: number, coordY: number) => {
        entity.StampInfostarkov.forEach((row) => {
            row?.changeProperty('CoordX', coordX);
            row?.changeProperty('CoordY', coordY);
        });
    };

    useEffect(() => {
        showStamps();
    }, [entity.StampInfostarkov]);

    useEffect(() => {
        setCurrentPageNumber(pageInfo?.Number ?? 1);
        updateBackgroundImage(pageInfo);
        showStamps();
        updateCoordsFromEntity();
        setBtnState();
    }, [pageInfo]);
    //#endregion

    //#region DragControl
    const [coordsText, setCoordsText] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const boxRefs = entity.StampInfostarkov
        .filter(row => row.PageNumber == currentPageNumber)
        .map(row => {
            return ({
                boxRef: useRef<HTMLDivElement>(null),
                stampId: row.Id
            });
        });
    const isClicked = useRef(false);
    const coords = useRef<{
        startX: number,
        startY: number,
        lastX: number,
        lastY: number
    }>({
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0
    })

    function pxToDot(num: number) {
        return num / 96 * 72;
    }

    function dotToPx(num: number) {
        return 96 / 72 * num;
    }

    useEffect(() => {
        var boxRef = boxRefs.find(x => x.stampId == currentStampId)?.boxRef;
        if (!boxRef?.current || !containerRef.current || !isEnabled)
            return;

        const box = boxRef.current;
        const container = containerRef.current;
        const onMouseDown = (e: MouseEvent) => {
            isClicked.current = true;
            coords.current.startX = e.clientX;
            coords.current.startY = e.clientY;
        }
        const onMouseUp = (e: MouseEvent) => {
            isClicked.current = false;
            if (coords.current.lastX === box.offsetLeft && coords.current.lastY === box.offsetTop)
                return;

            coords.current.lastX = box.offsetLeft;
            coords.current.lastY = box.offsetTop;
            let convertedX = pxToDot(box.offsetLeft);
            let convertedY = pxToDot(box.offsetTop);
            setCoordsText(`X: ${convertedX.toFixed(1)}, Y: ${convertedY.toFixed(1)}`);
            handleCoordinateChange(convertedX, convertedY);
        }
        const onMouseMove = (e: MouseEvent) => {
            if (!isClicked.current)
                return;

            const nextX = e.clientX - coords.current.startX + coords.current.lastX;
            const nextY = e.clientY - coords.current.startY + coords.current.lastY;
            box.style.left = `${nextX}px`;
            box.style.top = `${nextY}px`;
        }

        box.addEventListener('mousedown', onMouseDown);
        box.addEventListener('mouseup', onMouseUp);
        container.addEventListener('mousemove', onMouseMove);
        container.addEventListener('mouseleave', onMouseUp);

        const cleanup = () => {
            box.removeEventListener('mousedown', onMouseDown);
            box.removeEventListener('mouseup', onMouseUp);
            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('mouseleave', onMouseUp);
        }

        return cleanup;
    }, [currentStampId]);
    //#endregion

    //#region Elements
    function showStamps() {
        entity.StampInfostarkov
            .filter(row => row.PageNumber == currentPageNumber)
            .map(row => {
                let mainDiv = document.getElementById(`dynamic-html${row.Id}`);
                if (mainDiv?.childNodes.length == 0) {
                    let htmlObject = document.createElement('div');
                    htmlObject.innerHTML = row.StampHtml;
                    htmlObject.className = 'stamp';
                    htmlObject.onmouseenter = function () { setCurrentStampId(row.Id) };
                    mainDiv?.appendChild(htmlObject);
                }
                else {
                    mainDiv?.childNodes.forEach((node) => {
                        var divElem = node as HTMLDivElement;
                        if (divElem != null)
                            divElem.innerHTML = row.StampHtml;
                    });
                }
            })
    }

    function updateBackgroundImage(pageInfo: IPagesRow | undefined) {
        let pageDiv = document.getElementById(`page`) as HTMLDivElement;
        if (pageDiv != null) {
            pageDiv.style.backgroundImage = `url(data:image/png;base64,${pageInfo?.Page})`;
            updateOrientation(pageInfo?.IsLandscape ?? false);
        }
    }

    function updateOrientation(isLandscape: boolean) {
        let cssStyleNames = new Array<string>('.page', 'main');
        cssStyleNames.map((val) => {
            const element = document.querySelector(val) as HTMLElement;
            if (element) {
                element.style.width = isLandscape ? '29.7cm' : '21cm';
                element.style.height = isLandscape ? '21cm' : '29.7cm';
            }
        });
    }

    function updateCoordsFromEntity() {
        entity.StampInfostarkov
            .filter(row => row.PageNumber == currentPageNumber)
            .map((row) => {
                var boxRef = boxRefs.find(x => x.stampId == row.Id)?.boxRef;
                if (!boxRef?.current)
                    return;

                let x = dotToPx(row?.CoordX ?? 0);
                let y = dotToPx(row?.CoordY ?? 0);
                setCoordsText(`X: ${row?.CoordX.toFixed(1) ?? 0}, Y: ${row?.CoordY.toFixed(1) ?? 0}`);
                coords.current.lastX = x;
                coords.current.lastY = y;
                boxRef.current.style.left = `${x}px`;
                boxRef.current.style.top = `${y}px`;
            });
    }

    function setNextPageNumber(isNext: boolean) {
        var nextNumber = isNext ? currentPageNumber + 1 : currentPageNumber - 1;
        if (nextNumber < 1 || nextNumber > entity.Pagesstarkov.length)
            return;

        updatePage(nextNumber);
    }

    function updatePage(nextNumber: number) {
        setPageInfo(entity.Pagesstarkov.find((row) => row.Number == nextNumber));
    }

    function setBtnState() {
        var disabledAttribute = 'disabled';
        var prewiousPageBtn = document.getElementById(`prewiousPageBtn`) as HTMLDivElement;
        var nextPageBtn = document.getElementById(`nextPageBtn`) as HTMLDivElement;

        prewiousPageBtn.removeAttribute(disabledAttribute);
        nextPageBtn.removeAttribute(disabledAttribute);
        if (currentPageNumber == 1)
            prewiousPageBtn.setAttribute(disabledAttribute, disabledAttribute);
        else if (currentPageNumber == entity.Pagesstarkov.length)
            nextPageBtn.setAttribute(disabledAttribute, disabledAttribute);
    }
    //#endregion

    return (
        <main>
            <label id='coords'>{currentStampId}</label>
            <select id='page-number' onChange={(e) => updatePage(Number((e as React.ChangeEvent<HTMLSelectElement>).target.value))}>
                {
                    entity.Pagesstarkov
                        .map(row => {
                            return (
                                <option key={row.Number}>{row.Number}</option>
                            );
                        })}
            </select>
            <div>
                <button id='prewiousPageBtn' onClick={() => setNextPageNumber(false)}>Prewious</button>
                <button id='nextPageBtn' onClick={() => setNextPageNumber(true)}>Next</button>
            </div>
            <label id='coords'>{coordsText}</label>
            <br />
            <div id='page' className='page' ref={containerRef}>
                {
                    entity.StampInfostarkov
                        .filter(row => row.PageNumber == currentPageNumber)
                        .map((row) => {
                            return (
                                <div
                                    key={row.Id}
                                    id={`dynamic-html${row.Id}`}
                                    className='stamp'
                                    ref={boxRefs.find(x => x.stampId == row.Id)?.boxRef} />
                            );
                        })
                }
            </div>
        </main>
    )
}

export default StampControl;