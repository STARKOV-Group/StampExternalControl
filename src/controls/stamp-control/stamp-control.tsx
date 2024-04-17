import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { IRemoteComponentCardApi, ControlUpdateHandler, IChildEntityCollection } from '@directum/sungero-remote-component-types';
import { ICustomEntity, IPagesRow, IStampInfoRow } from './types';
import { dotToPx, pxToDot } from './functions';
import StampContainer from './context-menu/stamp-container'
import PageContainer from './context-menu/page-container'
import './stamp-control.css'
import { stampHtml, page1, page2 } from '../../../test-data';

interface IProps {
    api: IRemoteComponentCardApi;
}

const StampControl: React.FC<IProps> = ({ api }) => {
    //#region Props
    const [entity, setEntity] = useState(() => api.getEntity<ICustomEntity>());
    const [pageInfo, setPageInfo] = useState(entity.Pagesstarkov.find(() => true));
    const [stampInfo, setStampInfo] = useState(entity.StampInfostarkov);
    const [currentStampId, setCurrentStampId] = useState<number>();
    const [coordsText, setCoordsText] = useState('');
    const isLocked = entity.LockInfo && entity.LockInfo.IsLocked && (!entity.LockInfo.IsLockedByMe || !entity.LockInfo.IsLockedHere);
    const isEnabled = entity.State.IsEnabled && !isLocked;
    const isClicked = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [boxRefs, setBoxRefs] = useState(stampInfo
        ?.map(row => {
            return ({
                boxRef: createRef<HTMLDivElement>(),
                stampId: row.Id,
                coords: {
                    startX: 0,
                    startY: 0,
                    lastX: 0,
                    lastY: 0
                }
            });
        }));
    //#endregion

    //#region Entity
    const handleControlUpdate: ControlUpdateHandler = useCallback(() => {
        setEntity(api.getEntity<ICustomEntity>());
        setStampInfo(entity?.StampInfostarkov);
        setPageInfo(entity?.Pagesstarkov.find(() => true));
    }, [api, setEntity]);
    api.onControlUpdate = handleControlUpdate;

    const handleCoordinateChange = (stampId: number | undefined, coordX: number, coordY: number) => {
        var currentStamp = stampInfo.find(x => x.Id == stampId);
        currentStamp?.changeProperty('CoordX', coordX);
        currentStamp?.changeProperty('CoordY', coordY);
    };

    useEffect(() => {
        updateBoxRefs();
        showStamps();
    }, [stampInfo]);

    useEffect(() => {
        updateBackgroundImage(pageInfo);
        showStamps();
        setBtnState();
    }, [pageInfo]);

    function updateBoxRefs() {
        setBoxRefs(stampInfo
            ?.map(row => {
                return ({
                    boxRef: createRef<HTMLDivElement>(),
                    stampId: row.Id,
                    coords: {
                        startX: 0,
                        startY: 0,
                        lastX: 0,
                        lastY: 0
                    }
                });
            }))
    };
    //#endregion

    //#region DragControl
    useEffect(() => {
        var currentStamp = boxRefs.find(x => x.stampId == currentStampId);
        var coords = currentStamp?.coords;
        var boxRef = currentStamp?.boxRef;
        if (!boxRef?.current || !containerRef.current || !isEnabled)
            return;

        const box = boxRef.current;
        const container = containerRef.current;
        const onMouseDown = (e: MouseEvent) => {
            isClicked.current = true;
            if (!coords)
                return;

            coords.startX = e.clientX;
            coords.startY = e.clientY;
            coords.lastX = box.offsetLeft;
            coords.lastY = box.offsetTop;
        }
        const onMouseUp = (e: MouseEvent) => {
            isClicked.current = false;
            if (!coords)
                return;

            if (coords.lastX === box.offsetLeft && coords.lastY === box.offsetTop)
                return;

            coords.lastX = box.offsetLeft;
            coords.lastY = box.offsetTop;
            let convertedX = pxToDot(box.offsetLeft);
            let convertedY = pxToDot(box.offsetTop);
            setCoordsText(`X: ${convertedX.toFixed(1)}, Y: ${convertedY.toFixed(1)}`);
            handleCoordinateChange(currentStamp?.stampId, convertedX, convertedY);
        }
        const onMouseMove = (e: MouseEvent) => {
            if (!isClicked.current || !coords)
                return;

            const nextX = e.clientX - coords.startX + coords.lastX;
            const nextY = e.clientY - coords.startY + coords.lastY;
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
        stampInfo
            .filter(row => row.PageNumber == pageInfo?.Number)
            .map(row => {
                let mainDiv = document.getElementById(`stamp-container${row.Id}`);
                if (mainDiv?.childNodes?.length == 0) {
                    let htmlObject = document.createElement('div');
                    htmlObject.innerHTML = row.StampHtml;
                    htmlObject.className = 'stamp';
                    htmlObject.onmousedown = function () {
                        setCurrentStampId(row.Id);
                    };
                    mainDiv?.appendChild(htmlObject);
                    updateStampCoords(row);
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

    function updateStampCoords(row: IStampInfoRow) {
        var currentStamp = boxRefs.find(x => x.stampId == row.Id);
        var coords = currentStamp?.coords;
        var boxRef = currentStamp?.boxRef.current;
        if (!boxRef || !coords)
            return;

        let x = dotToPx(row?.CoordX ?? 0);
        let y = dotToPx(row?.CoordY ?? 0);
        setCoordsText(`X: ${row?.CoordX.toFixed(1) ?? 0}, Y: ${row?.CoordY.toFixed(1) ?? 0}`);
        coords.lastX = x;
        coords.lastY = y;
        boxRef.style.left = `${x}px`;
        boxRef.style.top = `${y}px`;
    }

    function setNextPageNumber(isNext: boolean) {
        var pageNumber = Number(pageInfo?.Number);
        var nextNumber = isNext ? pageNumber + 1 : pageNumber - 1;
        if (nextNumber < 1 || nextNumber > entity?.Pagesstarkov?.length)
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
        if (pageInfo?.Number == 1)
            prewiousPageBtn.setAttribute(disabledAttribute, disabledAttribute);
        else if (pageInfo?.Number == entity?.Pagesstarkov?.length)
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
            <PageContainer Id='page' Ref={containerRef} entity={entity} pageNumber={pageInfo?.Number ?? 1}>
                {
                    stampInfo
                        .filter(row => row.PageNumber == pageInfo?.Number)
                        .map((row) => {
                            return (
                                <StampContainer
                                    key={row.Id}
                                    Id={`stamp-container${row.Id}`}
                                    Ref={boxRefs.find(x => x.stampId == row.Id)?.boxRef}
                                    entity={entity}
                                    stampId={row.Id} />
                            );
                        })
                }
            </PageContainer>
        </main>
    )
}

export default StampControl;