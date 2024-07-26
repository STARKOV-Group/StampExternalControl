import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
import { IRemoteComponentCardApi, ControlUpdateHandler, IRemoteComponentContext } from '@directum/sungero-remote-component-types';
import { ICustomEntity, IPageInfo, IStampInfoRow } from './types';
import { dotToPx, pxToDot } from './functions';
import StampContainer from './stamp-container'
import PageContainer from './page-container'
import './stamp-control.css'
import '../../../i18n';
import { useTranslation } from 'react-i18next';
const spinner = require("/public/img/Spinner.svg");
const leftBtn = require("/public/img/previous.png");
const rightBtn = require("/public/img/next.png");

interface IProps {
    initialContext: IRemoteComponentContext;
    api: IRemoteComponentCardApi;
}

const DEFAULT_CULTURE = 'en';

const StampControl: React.FC<IProps> = ({ initialContext, api }) => {
    //#region Props
    const [entity, setEntity] = useState(() => api.getEntity<ICustomEntity>());
    const [currentPageInfo, setCurrentPageInfo] = useState<IPageInfo>();
    const [pageCount, setPageCount] = useState(0);
    const [stampInfo, setStampInfo] = useState(entity.StampInfostarkov);
    const [currentStampId, setCurrentStampId] = useState<number>();
    const [coordsText, setCoordsText] = useState('');
    const [context, setContext] = useState(initialContext);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const currentCulture = context.currentCulture ?? DEFAULT_CULTURE;
    const { t, i18n } = useTranslation();
    const isLocked = entity.LockInfo && entity.LockInfo.IsLocked && (!entity.LockInfo.IsLockedByMe || !entity.LockInfo.IsLockedHere);
    const isEnabled = entity.State.IsEnabled && !isLocked;
    const isClicked = useRef(false);
    const pageSelectorRef = useRef<HTMLSelectElement>(null);
    const nextBtnRef = useRef<HTMLInputElement>(null);
    const prevBtnRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    let boxRefs = stampInfo?.map(row => {
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
    });
    //#endregion

    //#region Handlers
    const handleControlUpdate: ControlUpdateHandler = useCallback((updatedContext) => {
        setEntity(api.getEntity<ICustomEntity>());
        setStampInfo(entity?.StampInfostarkov);
        setContext(updatedContext);
    }, [api, setEntity]);
    api.onControlUpdate = handleControlUpdate;

    const handleCoordinateChange = (stampId: number | undefined, coordX: number, coordY: number) => {
        var currentStamp = stampInfo.find(x => x.Id == stampId);
        currentStamp?.changeProperty('CoordX', coordX);
        currentStamp?.changeProperty('CoordY', coordY);
    };

    useEffect(() => {
        getPageCount();
        getPage(1);
    }, []);

    useEffect(() => {
        showStamps();
    }, [stampInfo]);

    useEffect(() => {
        updateBackgroundImage(currentPageInfo);
        showStamps();
        setBtnState();
    }, [currentPageInfo]);

    useEffect(() => {
        i18n.changeLanguage(currentCulture);
    }, [currentCulture]);

    useEffect(() => {
        let pageDiv = containerRef.current;
        if (pageDiv && isLoading) {
            pageDiv.style.backgroundImage = `url(${spinner})`;
            pageDiv.style.backgroundPosition = `center`;
            pageDiv.style.backgroundSize = `40%`;
            pageDiv.style.backgroundRepeat = `no-repeat`;
        }
    }, [isLoading]);
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
            if (convertedX && convertedY) {
                setCoordsText(`X: ${convertedX.toFixed(1)}, Y: ${convertedY.toFixed(1)}`);
                handleCoordinateChange(currentStamp?.stampId, convertedX, convertedY);
            }
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
            .filter(row => row.PageNumber == currentPageInfo?.Number)
            .map(row => {
                if (!row.CoordX || !row.CoordY)
                    return;

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
                        if (divElem)
                            divElem.innerHTML = row.StampHtml;
                    });
                }
            })
    }

    function updateBackgroundImage(pageInfo: IPageInfo | undefined) {
        let pageDiv = containerRef.current;
        if (pageDiv) {
            pageDiv.style.backgroundImage = `url(data:image/png;base64,${pageInfo?.Page})`;
            pageDiv.style.backgroundSize = `contain`;
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
        coords.lastX = x;
        coords.lastY = y;
        boxRef.style.left = `${x}px`;
        boxRef.style.top = `${y}px`;
    }

    function setNextPageNumber(isNext: boolean) {
        var pageNumber = Number(currentPageInfo?.Number);
        var nextNumber = isNext ? pageNumber + 1 : pageNumber - 1;
        if (nextNumber < 1 || nextNumber > pageCount)
            return;

        if (pageSelectorRef.current)
            pageSelectorRef.current.value = nextNumber.toString();
        getPage(nextNumber);
    }

    function setBtnState() {
        var disabledAttribute = 'disabled';
        var prewiousPageBtn = prevBtnRef.current;
        var nextPageBtn = nextBtnRef.current;
        if (!prewiousPageBtn || !nextPageBtn)
            return;

        prewiousPageBtn.removeAttribute(disabledAttribute);
        nextPageBtn.removeAttribute(disabledAttribute);
        if (currentPageInfo?.Number == 1)
            prewiousPageBtn.setAttribute(disabledAttribute, disabledAttribute);
        if (currentPageInfo?.Number == pageCount)
            nextPageBtn.setAttribute(disabledAttribute, disabledAttribute);
    }
    //#endregion

    //#region Integration
    async function executeFetch(requestString: string) {
        var host = window.location.protocol + "//" + window.location.host;
        const options = {
            headers: new Headers({
                'content-type': 'application/json',
                'accept': 'application/json'
            })
        };
        var response = await fetch(`${host}/Integration/odata/${requestString}`, options)
            .then(res => {
                if (res.ok) {
                    setFetchError('');
                    return res.json();
                }
                return res.text().then(text => {
                    setFetchError(text);
                    throw new Error(text);
                })
            });
        return JSON.parse(response.value);
    }

    async function getPage(nextNumber: number) {
        setIsLoading(true);
        var jsonData = await executeFetch(`Common/GetDocumentPage(docId=${entity.Id},pageNum=${nextNumber})`);
        setIsLoading(false);
        var pageRow = {
            Number: nextNumber,
            IsLandscape: jsonData.IsLandscape,
            Page: jsonData.Image
        } as IPageInfo;
        setCurrentPageInfo(pageRow);
    }

    async function getPageCount() {
        var jsonData = await executeFetch(`Common/GetDocumentPageCount(docId=${entity.Id})`);
        setPageCount(jsonData);
    }
    //#endregion

    return (
        <div className='main-div'>
            <main>
                {fetchError ? <p style={{ color: 'red' }}>{fetchError}</p> : null}
                <select
                    id='page-number'
                    onChange={(e) => getPage(Number((e as React.ChangeEvent<HTMLSelectElement>).target.value))}
                    ref={pageSelectorRef}>
                    {
                        Array.from(Array(pageCount).keys())
                            .map(x => {
                                return (
                                    <option key={x + 1}>{x + 1}</option>
                                );
                            })
                    }
                </select>
                <div className='grid-container'>
                    <input
                        type="image"
                        id='prewiousPageBtn'
                        src={leftBtn}
                        onClick={() => setNextPageNumber(false)}
                        ref={prevBtnRef} />
                    <input
                        type="image"
                        id='nextPageBtn'
                        src={rightBtn}
                        onClick={() => setNextPageNumber(true)}
                        ref={nextBtnRef} />
                </div>
                <br />
                {coordsText ?
                    <div>
                        <label id='coords'>{coordsText}</label>
                        <br />
                    </div> : null}
                <PageContainer Id='page' Ref={containerRef} entity={entity} pageNumber={currentPageInfo?.Number ?? 1}>
                    {
                        stampInfo
                            .filter(row => row.PageNumber == currentPageInfo?.Number)
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
        </div>
    )
}

export default StampControl;