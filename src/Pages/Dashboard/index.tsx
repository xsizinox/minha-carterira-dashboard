import React, { useState, useMemo, useCallback } from "react";

import SelectInput from "../../Components/SelectInput";
import ContentHeader from "../../Components/ContentHeader";
import WalletBox from "../../Components/WalletBox";
import MessageBox from "../../Components/MessageBox";
import PieChartBox from "../../Components/PieChartBox";
import HistoryBox from "../../Components/HistoryBox";
import BarChartBox from "../../Components/BarChartBox";

import gains from '../../repositories/gains';
import expenses from '../../repositories/expenses';
import listOFmonths from '../../utils/months';

import happyImg from '../../assets/happy.svg'
import sadImg from '../../assets/sad.svg'
import grinningImg from '../../assets/grinning.svg'

import { Container, Content } from "./style";


const Dashboard: React.FC = ( ) => {
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1) ;
    const [YearSelected, setYearSelected] = useState<number>(new Date().getFullYear());
    
    const years = useMemo(()=> {
        let uniqueYears: number[] = [];

        [...expenses, ...gains].forEach(item => {
            const date = new Date(item.date);
            const year = date.getFullYear();

            if(!uniqueYears.includes(year)){
                uniqueYears.push(year)
            }
        });

        return uniqueYears.map(year =>{
            return{
                value:year,
                label:year,
            }
        })
    },[]);

    const months = useMemo(()=> {
        return listOFmonths.map((month, index) => {
            return {
                value:index + 1,
                label:month,
            }
        });
    },[])

    const totalExpense = useMemo (()=> {
        let total: number = 0;

        expenses.forEach(item => {
            const date = new Date(item.date);
            const year = date.getFullYear();
            const month = date.getMonth( ) +1;

            if(month === monthSelected && year === YearSelected) {
               try{
                total += Number(item.amount)
               } catch{
                   throw new Error('Invalid amount! Amount must be number')
               }
            }
        });
        return total
    },[monthSelected, YearSelected])

    const totalGains = useMemo (()=> {
        let total: number = 0;

        gains.forEach(item => {
            const date = new Date(item.date);
            const year = date.getFullYear();
            const month = date.getMonth( ) +1;

            if(month === monthSelected && year === YearSelected) {
               try{
                total += Number(item.amount)
               } catch{
                   throw new Error('Invalid amount! Amount must be number')
               }
            }
        });
        return total
    },[monthSelected, YearSelected])

    const totalBalance = useMemo(() => {
       return totalGains - totalExpense;
    },[totalGains, totalExpense])

    const message = useMemo(() => {
        if(totalBalance < 0){
            return {
                title:"Que triste!",
                description:"Neste mês, você gastou mais do que deveria",
                footerText:"Verifique seus gastos e tente cortar algumas coisas desnecessárias.",
                icon: sadImg
            }
        }

        else if(totalGains === 0 && totalExpense === 0) {
            return {
                title:"Op's!",
                description:"Neste mês, não há registros de entradas ou saídas",
                footerText:"Parece qeu você não fez nenhum registro no mês e ano selecionado.",
                icon: grinningImg
            }
        }

        else if(totalBalance === 0) {
            return {
                title:"Ufaa!!!",
                description:"Neste mês, você gastou exatamente o que ganhou",
                footerText:"Tenha cuidado. No próximo temte poupar o seu dinheiro.",
                icon: grinningImg
            }
        }


        else {
            return {
                title:"Muito Bem!",
                description:"Sua carteira está Positiva",
                footerText:"Continue assim. Considere investir o seu saldo.",
                icon:happyImg
            }
        }
    },[totalBalance, totalExpense, totalGains])

    const relationExpensesVersusGains = useMemo (() => {
        const total = totalGains + totalExpense;

        const percentGains = Number(((totalGains / total) * 100).toFixed(1));
        const percentExpense = Number(((totalExpense / total) * 100).toFixed(1));

        const data = [
            {
                name: "Entradas",
                value: totalGains,
                percent: percentGains ? percentGains : 0,
                color: '#f7931b'
            },
            {
                name: "Saídas",
                value: totalExpense,
                percent: percentExpense ? percentExpense : 0,
                color: '#e44c4e'
            }
        ]

        return data;

    },[totalGains, totalExpense] )

    const historyData = useMemo(() => {
        return listOFmonths.map((_, month ) => {
            let amountEntry = 0;
            gains.forEach(gain => {
                const date = new Date(gain.date)
                const gainMonth = date.getMonth();
                const gainYear = date.getFullYear();

                if (gainMonth === month && gainYear === YearSelected) {
                    try {
                        amountEntry += Number(gain.amount)
                    }catch {
                        throw new Error ('amountEntry is invalid. amountEntry must be a valid number')
                    }
                }
            });

            let amountOutput = 0;
            expenses.forEach(expense => {
                const date = new Date(expense.date)
                const gainMonth = date.getMonth();
                const gainYear = date.getFullYear();

                if (gainMonth === month && gainYear === YearSelected) {
                    try {
                        amountOutput += Number(expense.amount)
                    }catch {
                        throw new Error ('amountOutput is invalid. amountOutput must be a valid number')
                    }
                }
            });

            return {
                monthNumber: month,
                month: listOFmonths[month].substr(0, 3),
                amountEntry,
                amountOutput
            }
        })
        .filter(item => {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            return(YearSelected === currentYear && item.monthNumber <= currentMonth) || (YearSelected < currentYear)
        });
    },[monthSelected, YearSelected])

    const relationExpensevesRecurrentVersusEventual = useMemo(() => {
        let amountRecurrent = 0;
        let amountEventual = 0;

        expenses.filter((expense) => {
            const date = new Date(expense.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            return month === monthSelected && year === YearSelected;
        })

        .forEach((expense) => {
            if(expense.frequency === 'recorrente'){
                return amountRecurrent += Number(expense.amount)
            }

            if(expense.frequency === 'eventual'){
                return amountEventual += Number(expense.amount)
            }
        });

        const total = amountRecurrent + amountEventual;

        const recurrentPercent = Number(((amountRecurrent / total) * 100).toFixed(1));
        const eventualPercent = Number(((amountEventual / total) * 100).toFixed(1));
        

        return [
            {
                name: 'Recorrentes',
                amount: amountRecurrent,
                percent: recurrentPercent ? recurrentPercent : 0,
                color: "#f7931b"
            },
            {
                name: 'Eventuais',
                amount: amountEventual,
                percent: eventualPercent ? eventualPercent : 0,
                color: "#e44c4e"
            },
                ]           
    },[monthSelected, YearSelected])

    const relationGainsRecurrentVersusEventual = useMemo(() => {
        let amountRecurrent = 0;
        let amountEventual = 0;

        gains.filter((gains) => {
            const date = new Date(gains.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            return month === monthSelected && year === YearSelected;
        })

        .forEach((gains) => {
            if(gains.frequency === 'recorrente'){
                return amountRecurrent += Number(gains.amount)
            }

            if(gains.frequency === 'eventual'){
                return amountEventual += Number(gains.amount)
            }
        });

        const total = amountRecurrent + amountEventual;

        const recurrentPercent = Number(((amountRecurrent / total) * 100).toFixed(1));
        const eventualPercent = Number(((amountEventual / total) * 100).toFixed(1));
        

        return [
            {
                name: 'Recorrentes',
                amount: amountRecurrent,
                percent: recurrentPercent ? recurrentPercent : 0,
                color: "#f7931b"
            },
            {
                name: 'Eventuais',
                amount: amountEventual,
                percent: eventualPercent ? eventualPercent : 0,
                color: "#e44c4e"
            },
                ]           
    },[monthSelected, YearSelected])

    const hundleMonthSelected = useCallback((month: string) => {
        try {
            const parseMonth = Number(month)
            setMonthSelected(parseMonth)
        }catch(error)
        {
            throw new Error('invalid month value. Is accept 0 - 24.')
        }
    },[]);

    const hundleYearSelected = useCallback((year: string) => {
        try {
            const parseYear = Number(year)
            setYearSelected(parseYear)
        }catch(error)
        {
            throw new Error('invalid year value. Is accept integer numbers')
        }
    },[]);

    return (
        <Container>
            <ContentHeader title="Dashboard" lineColor="#f7931b">
            <SelectInput options={months} 
                             onChange={(e) => hundleMonthSelected(e.target.value)} 
                             defaultValue={monthSelected}/>
                <SelectInput options={years} onChange={(e) => hundleYearSelected(e.target.value)} defaultValue={YearSelected}/>
            </ContentHeader>

            <Content>
                <WalletBox 
                    title="saldo"
                    color="#4e41f0"
                    amount={totalBalance}
                    footerlabel="Atualizado com base nas entradas e saídas"
                    icon="dolar"
                />

                <WalletBox 
                    title="entradas"
                    color="#f7931b"
                    amount={totalGains}
                    footerlabel="Atualizado com base nas entradas e saídas"
                    icon="arrowUp"
                />

                <WalletBox 
                    title="saída"
                    color="#e44c4e"
                    amount={totalExpense}
                    footerlabel="Atualizado com base nas entradas e saídas"
                    icon="arrowDown"
                />


                <MessageBox 
                    title={message.title}
                    description={message.description}
                    footerText={message.footerText}
                    icon={message.icon}
                />


                <PieChartBox data={relationExpensesVersusGains} />

                <HistoryBox 
                    data={historyData}
                    lineColorAmountEntry="#f7931b"
                    lineColorAmountOutput="#e44c4e"
                />

                <BarChartBox 
                title="Saídas"
                data={relationExpensevesRecurrentVersusEventual} />
                
                <BarChartBox 
                title="Entradas"
                data={relationGainsRecurrentVersusEventual} />

            </Content>
        </Container>
    );
}

export default Dashboard