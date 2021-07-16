import styled from "styled-components";

export const Container = styled.button `
    width: 100%;
    padding: 10px;
    margin: 7px 0;
    border-radius: 5px;
    font-weight:bold;
    color: ${props => props.theme.colors.white};
    background-color: ${props => props.theme.colors.warning};
    transition: opacity .3s ;

    &:hover {
        opacity: 7;
    }

`;