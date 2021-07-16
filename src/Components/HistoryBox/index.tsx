import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, CartesianGrid, Tooltip } from "recharts";

import { Container, Header, LegendContainer, Legends } from "./style";

import formatCurrency from "../../utils/formatCurrency";

interface IHistoryBox {
    data: {
        month: string;
        amountEntry: number;
        amountOutput: number;

    }[],
    lineColorAmountEntry: string,
    lineColorAmountOutput: string;
}

const HistoryBox: React.FC<IHistoryBox> = ({
    data, lineColorAmountEntry, lineColorAmountOutput
}) =>  (
        <Container>

            <Header>
            <h2>Histórico de saldo</h2>

            <LegendContainer>
                <Legends color={lineColorAmountEntry}>
                    <div></div>
                    <span>Entradas</span>
                </Legends>

                <Legends color={lineColorAmountOutput}>
                    <div></div>
                    <span>Saídas</span>
                </Legends>
            </LegendContainer>
            </Header>

            <ResponsiveContainer>
                <LineChart data={data} margin={{top: 5, right:20, left:20, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cecece" />
                    <XAxis dataKey="month" stroke="#cecece"/>
                    <Tooltip formatter={(value: any) => formatCurrency (Number(value))}/>
                    <Line
                        type="monotone"
                        dataKey="amountEntry"
                        name="Entradas"
                        stroke={lineColorAmountEntry}
                        strokeWidth={5}
                        dot= {{ r:5 }}
                        activeDot={{r:8}}
                    />

                    <Line
                        type="monotone"
                        dataKey="amountOutput"
                        name="Saídas"
                        stroke={lineColorAmountOutput}
                        strokeWidth={5}
                        dot= {{ r:5 }}
                        activeDot={{r:8}}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Container>
    );


export default HistoryBox;