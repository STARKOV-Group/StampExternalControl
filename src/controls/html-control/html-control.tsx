import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { IEntity, IRemoteControlInfo, IRemoteComponentCardApi, ControlUpdateHandler } from '@directum/sungero-remote-component-types';
import './html-control.css'

interface IEntityWithProperties extends IEntity {
    [property: string]: any
}

interface IProps {
    api: IRemoteComponentCardApi;
    controlInfo: IRemoteControlInfo;
}

const HtmlControl: React.FC<IProps> = ({ api, controlInfo }) => {
    const propertyName = controlInfo.propertyName;
    if (!propertyName)
        throw new Error('propertyName is not defined');

    //#region Entity
    const [entity, setEntity] = React.useState<IEntityWithProperties>(() => api.getEntity<IEntityWithProperties>());
    const [stamp, setStamp] = React.useState('');
    const handleControlUpdate: ControlUpdateHandler = React.useCallback(() => {
        setEntity(api.getEntity<IEntityWithProperties>());
        setStamp(entity[propertyName as string] ?? '');
    }, [api, setEntity]);
    React.useEffect(() => {
        showStamp();
    }, [stamp]);
    useLayoutEffect(() => {
        setStamp(entity[propertyName as string] ?? '');
    }, []);
    api.onControlUpdate = handleControlUpdate;
    //#endregion

    //#region DragControl
    const containerRef = useRef<HTMLDivElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        if (!boxRef.current || !containerRef.current)
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
            coords.current.lastX = box.offsetLeft;
            coords.current.lastY = box.offsetTop;
        }
        const onMouseMove = (e: MouseEvent) => {
            if (!isClicked.current)
                return;

            const nextX = e.clientX - coords.current.startX + coords.current.lastX;
            const nextY = e.clientY - coords.current.startY + coords.current.lastY;
            box.style.left = `${nextX}px`
            box.style.top = `${nextY}px`
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
    }, []);
    //#endregion

    function showStamp() {
        let mainDiv = document.getElementById('dynamic-html');
        mainDiv?.childNodes.forEach((node) => {
            mainDiv?.removeChild(node)
        })
        let htmlObject = document.createElement('div');
        htmlObject.innerHTML = stamp;
        htmlObject.className = 'stamp';
        mainDiv?.appendChild(htmlObject);
    }

    return (
        <main>
            <div id='page' className="page" ref={containerRef}>
                <div id='dynamic-html' className='stamp' ref={boxRef} />
            </div>
        </main>
    )
}

export default HtmlControl;