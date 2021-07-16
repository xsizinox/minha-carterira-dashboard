import  React, { useMemo, useState, useEffect }  from "react";
import { Container, Content, Filters } from './style';
import { uuid } from 'uuidv4';

import ContentHeader from "../../Components/ContentHeader";
import SelectInput from "../../Components/SelectInput";
import HistoryFinanceCard from "../../Components/HistoryFinanceCard";

import gains from '../../repositories/gains';
import expenses from '../../repositories/expenses';

import formatCurrency from '../../utils/formatCurrency'
import formatDate from "../../utils/formatDate";
import listOFmonths from '../../utils/months';


interface IRouteParams{
    match: {
        params:{
            type:string;
        }
    }
}

interface IData{
    id: string,
    description: string;
    amountFormated: string;
    frequency: string;
    dateFormated: string;
    tagColor: string
}

const List: React.FC<IRouteParams> = ({ match }) => {
    const [data, setData] = useState<IData[]>([]);
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1) ;
    const [YearSelected, setYearSelected] = useState<number>(new Date().getFullYear());
    const [FrequencyFilterSelected, setFrequencyFilterSelected] = useState (['recorrente', 'eventual']);
   
    const movimentType = match.params.type;

    const pageData = useMemo (() => {

       return movimentType === 'entry-balance' ?
       {
           title: 'Entradas',
           lineColor: '#4e41f0',
           data: gains
       }
       :
       {
            title: 'Saida',
            lineColor: '#e11c1e',
            data: expenses
    }
    },[movimentType]);

    const years = useMemo(()=> {
        let uniqueYears: number[] = [];

        const { data } = pageData;

        data.forEach(item => {
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
    },[pageData]);

    const months = useMemo(()=> {
        return listOFmonths.map((month, index) => {
            return {
                value:index + 1,
                label:month,
            }
        });
    },[])

    const handleFrequencyClick = (frequency: string) => {
        const alreadySelected = FrequencyFilterSelected.findIndex(item => item === frequency)
        if (alreadySelected >= 0) {
            const filtered = FrequencyFilterSelected.filter(item => item !== frequency);
            setFrequencyFilterSelected(filtered)
        } else{
            setFrequencyFilterSelected((prev) => [...prev, frequency ])
        }
    }

    const hundleMonthSelected = (month: string) => {
        try {
            const parseMonth = Number(month)
            setMonthSelected(parseMonth)
        }catch(error)
        {
            throw new Error('invalid month value. Is accept 0 - 24.')
        }
    }

    const hundleYearSelected = (year: string) => {
        try {
            const parseYear = Number(year)
            setYearSelected(parseYear)
        }catch(error)
        {
            throw new Error('invalid year value. Is accept integer numbers')
        }
    }

    useEffect (() => {
        const { data } = pageData;
        const filtredDate = data.filter(item => {
            const date = new Date(item.date);
            const month = date.getMonth() + 1;
            const year = (date.getFullYear());

            return month === monthSelected && year === YearSelected && FrequencyFilterSelected.includes(item.frequency);
        });

        const formatedData = filtredDate.map(item => {

            return {
                id:  uuid(),
                description: item.description,
                amountFormated: formatCurrency(Number(item.amount)),
                frequency: item.frequency,
                dateFormated: formatDate (item.date),
                tagColor: item.frequency === 'recorrente' ?'#4e41f0' : '#e44c4e'
            }
        })
        setData(formatedData)
    },[pageData,monthSelected,YearSelected, data.length, FrequencyFilterSelected]);

    return (
        <Container>
            <ContentHeader title={pageData.title} lineColor={pageData.lineColor}>
                <SelectInput options={months} 
                             onChange={(e) => hundleMonthSelected(e.target.value)} 
                             defaultValue={monthSelected}/>
                <SelectInput options={years} onChange={(e) => hundleYearSelected(e.target.value)} defaultValue={YearSelected}/>
            </ContentHeader>

            <Filters>
                <button 
                    type="button"
                    className={`tag-filter
                    tag-filter-recurrent
                    ${FrequencyFilterSelected.includes('recorrente') && 'tag-actived'}`}
                    onClick={() => handleFrequencyClick('recorrente')}
                >
                    Recorrentes
                </button>

                <button 
                    type="button"
                    className={`tag-filter tag-filter-eventuals 
                    ${FrequencyFilterSelected.includes('eventual') && 'tag-actived'}`}
                    onClick={() => handleFrequencyClick('eventual')}
                >
                    Eventuais
                </button>
            </Filters>

            <Content>
                { 
                data.map(item => (
                    <HistoryFinanceCard 
                        key={item.id}
                        tagColor={item.tagColor}
                        title={item.description}
                        subtitle={item.dateFormated}
                        amount={item.amountFormated}
                    />
                ))
                }
            </Content>
        </Container>
    );
}

export default List