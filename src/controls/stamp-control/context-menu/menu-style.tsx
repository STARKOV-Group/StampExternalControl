import styled, { css } from "styled-components";

interface IProps {
  top: number;
  left: number;
}

export const ContextMenu = styled.div<IProps>`
  position: absolute;
  background-color: grey;
  border-radius: 2px;
  box-sizing: border-box;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;

  ul {
    box-sizing: border-box;
    padding: 2px;
    margin: 0;
    list-style: none;
  }
  ul li {
    padding: 18px 12px;
  }
  /* hover */
  ul li:hover {
    cursor: pointer;
    background-color: white;
  }
`;
